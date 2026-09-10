import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile, UserRole } from '../lib/types'

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string, desiredRole: UserRole, teacherCode?: string) => Promise<UserRole>
  signUp: (name: string, email: string, password: string, desiredRole: UserRole, teacherCode?: string) => Promise<{ needsConfirmation: boolean; role: UserRole | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<Profile | null>
  claimTeacherAccess: (teacherCode: string) => Promise<Profile>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Could not load profile:', error.message)
    return null
  }
  return data as Profile
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Prevent an older profile request (for example the initial "student" row created
  // during signup) from overwriting a newer teacher-role refresh.
  const profileRequestVersion = useRef(0)

  const loadAndSetProfile = async (userId: string | null) => {
    const version = ++profileRequestVersion.current
    if (!userId) {
      setProfile(null)
      return null
    }

    const next = await fetchProfile(userId)
    if (version === profileRequestVersion.current) {
      setProfile(next)
    }
    return next
  }

  const setAuthoritativeProfile = (next: Profile | null) => {
    ++profileRequestVersion.current
    setProfile(next)
  }

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      setSession(data.session)
      await loadAndSetProfile(data.session?.user.id ?? null)
      if (mounted) setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return
      setSession(nextSession)

      // Supabase recommends keeping async work out of the auth callback itself.
      setTimeout(async () => {
        if (!mounted) return
        await loadAndSetProfile(nextSession?.user.id ?? null)
        if (mounted) setLoading(false)
      }, 0)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const refreshProfile = async () => {
    if (!session?.user) {
      setAuthoritativeProfile(null)
      return null
    }
    return loadAndSetProfile(session.user.id)
  }

  const claimTeacherAccess = async (teacherCode: string) => {
    const code = teacherCode.trim()
    if (!session?.user) throw new Error('You must be signed in first.')
    if (!code) throw new Error('Teacher access code is required.')

    const { error } = await supabase.rpc('claim_teacher_role', { p_code: code })
    if (error) throw error

    const upgraded = await fetchProfile(session.user.id)
    if (!upgraded || upgraded.role !== 'teacher') {
      throw new Error('Teacher access was accepted, but the profile did not update. Please try again.')
    }

    setAuthoritativeProfile(upgraded)
    return upgraded
  }

  const signIn = async (email: string, password: string, desiredRole: UserRole, teacherCode?: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    setSession(data.session)

    let nextProfile = await fetchProfile(data.user.id)
    if (!nextProfile) {
      await supabase.auth.signOut()
      throw new Error('Profile could not be loaded.')
    }

    // Every database user starts as a student. A teacher account is promoted only
    // after the teacher access code is verified by the secure Supabase RPC.
    if (desiredRole === 'teacher' && nextProfile.role !== 'teacher') {
      if (!teacherCode?.trim()) {
        await supabase.auth.signOut()
        setSession(null)
        setAuthoritativeProfile(null)
        throw new Error('This account still has the student role. Enter the teacher access code once to activate teacher access.')
      }

      const { error: roleError } = await supabase.rpc('claim_teacher_role', { p_code: teacherCode.trim() })
      if (roleError) {
        await supabase.auth.signOut()
        setSession(null)
        setAuthoritativeProfile(null)
        throw roleError
      }

      nextProfile = await fetchProfile(data.user.id)
      if (!nextProfile || nextProfile.role !== 'teacher') {
        await supabase.auth.signOut()
        setSession(null)
        setAuthoritativeProfile(null)
        throw new Error('Teacher role could not be activated.')
      }
    }

    if (nextProfile.role !== desiredRole) {
      await supabase.auth.signOut()
      setSession(null)
      setAuthoritativeProfile(null)
      throw new Error(`This account belongs to the ${nextProfile.role} portal.`)
    }

    setAuthoritativeProfile(nextProfile)
    return nextProfile.role
  }

  const signUp = async (name: string, email: string, password: string, desiredRole: UserRole, teacherCode?: string) => {
    if (desiredRole === 'teacher' && !teacherCode?.trim()) {
      throw new Error('Teacher access code is required.')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name.trim() } },
    })
    if (error) throw error

    const needsConfirmation = !data.session

    if (!data.session || !data.user) {
      return { needsConfirmation: true, role: null }
    }

    setSession(data.session)

    let nextProfile = await fetchProfile(data.user.id)
    if (!nextProfile) throw new Error('Account was created, but the profile could not be loaded.')

    if (desiredRole === 'teacher') {
      const { error: roleError } = await supabase.rpc('claim_teacher_role', { p_code: teacherCode!.trim() })
      if (roleError) throw roleError

      nextProfile = await fetchProfile(data.user.id)
      if (!nextProfile || nextProfile.role !== 'teacher') {
        throw new Error('Account was created, but teacher access could not be activated.')
      }
    }

    setAuthoritativeProfile(nextProfile)
    return { needsConfirmation, role: nextProfile.role }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setAuthoritativeProfile(null)
  }

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    claimTeacherAccess,
  }), [session, profile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
