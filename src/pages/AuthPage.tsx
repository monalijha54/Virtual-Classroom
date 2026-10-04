import { ArrowRight, GraduationCap, KeyRound, LogOut, School, ShieldCheck } from 'lucide-react'
import { FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../lib/types'

export function AuthPage({ role }: { role: UserRole }) {
  const { profile, loading, signIn, signUp, signOut, claimTeacherAccess } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [teacherCode, setTeacherCode] = useState('')
  const [busy, setBusy] = useState(false)

  const isTeacher = role === 'teacher'

  // If the user is already signed in to the same portal, send them straight in.
  if (!loading && profile?.role === role) {
    return <Navigate to={`/${role}`} replace />
  }

  // If a student-profile account reaches the teacher portal, do NOT bounce it
  // back to /student. This can happen when the account was created while email
  // confirmation was enabled, because the teacher-role RPC could not run during
  // signup. Let the signed-in user activate teacher access here instead.
  if (!loading && isTeacher && profile?.role === 'student') {
    async function handleTeacherActivation(e: FormEvent) {
      e.preventDefault()
      setBusy(true)
      try {
        await claimTeacherAccess(teacherCode)
        toast.success('Teacher access activated.')
        navigate('/teacher', { replace: true })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not activate teacher access')
      } finally {
        setBusy(false)
      }
    }

    return (
      <div className="flex min-h-screen items-center justify-center p-5" style={{ background: '#fafbfc' }}>
        <div className="w-full max-w-md border bg-white p-7 sm:p-8" style={{ borderRadius: 16, borderColor: '#eef0f3' }}>
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[12px]" style={{ background: '#ffd02f', color: '#1c1c1e' }}>
            <KeyRound size={24} />
          </div>
          <p className="eyebrow mb-2">Teacher portal</p>
          <h1 className="h-section text-2xl" style={{ color: '#1c1c1e' }}>Activate teacher access</h1>
          <p className="mt-2 text-sm leading-6" style={{ color: '#555a6a' }}>
            This account currently has the default student role. Enter the teacher access code once to upgrade it.
          </p>

          <div className="mt-5 rounded-[12px] p-4 text-sm" style={{ background: '#fff8e0', border: '1px solid #eef0f3' }}>
            <div className="font-medium" style={{ color: '#1c1c1e' }}>Signed in as {profile.full_name}</div>
            <div className="mt-1" style={{ color: '#555a6a' }}>{profile.email}</div>
          </div>

          <form onSubmit={handleTeacherActivation} className="mt-6 space-y-4">
            <div>
              <label className="label">Teacher access code</label>
              <input
                className="input"
                value={teacherCode}
                onChange={(e) => setTeacherCode(e.target.value)}
                placeholder="College-provided code"
                autoFocus
                required
              />
            </div>
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? 'Activating…' : 'Activate teacher access'} <ArrowRight size={17} />
            </button>
          </form>

          <button
            type="button"
            onClick={async () => {
              await signOut()
              setTeacherCode('')
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition hover:bg-black/5"
            style={{ color: '#555a6a' }}
          >
            <LogOut size={16} /> Sign out and use another account
          </button>
        </div>
      </div>
    )
  }

  // A teacher account cannot also use the student portal. Keep the role split explicit.
  if (!loading && profile && profile.role !== role) {
    return <Navigate to={`/${profile.role}`} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password, role, isTeacher ? teacherCode : undefined)
        navigate(`/${role}`, { replace: true })
      } else {
        const result = await signUp(name, email.trim(), password, role, isTeacher ? teacherCode : undefined)
        if (result.needsConfirmation) {
          toast.success(
            isTeacher
              ? 'Account created. Confirm your email, then sign in here with the teacher code once.'
              : 'Account created. Confirm your email, then sign in.',
          )
          setMode('login')
        } else {
          toast.success('Account created successfully.')
          navigate(`/${result.role ?? role}`, { replace: true })
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="board-dots relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between" style={{ background: '#1c1c1e', color: '#ffffff' }}>
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[8px] font-display text-sm font-semibold" style={{ background: '#ffd02f', color: '#1c1c1e' }}>RL</div>
          <div><div className="font-display text-lg font-medium">RuralLearn</div><div className="text-xs" style={{ color: '#a5a8b5' }}>Learn anywhere, grow everywhere</div></div>
        </Link>
        <div className="max-w-lg">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff', background: 'rgba(255,255,255,0.06)' }}>
            {isTeacher ? <School size={15} /> : <GraduationCap size={15} />}
            {isTeacher ? 'Teacher Portal' : 'Student Portal'}
          </div>
          <h1 className="mt-2 font-display text-4xl font-medium">Learn anywhere, grow everywhere.</h1>
          <p className="mt-5 text-lg leading-8" style={{ color: '#a5a8b5' }}>Simple online classes, notes, quizzes and live lessons — built for rural learners.</p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="rounded-[16px] p-4 text-sm font-medium" style={{ background: '#ffd02f', color: '#1c1c1e' }}>Classes</div>
            <div className="rounded-[16px] p-4 text-sm font-medium" style={{ background: '#fde0f0', color: '#1c1c1e' }}>Notes</div>
            <div className="rounded-[16px] p-4 text-sm font-medium" style={{ background: '#c3faf5', color: '#1c1c1e' }}>Quizzes</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: '#a5a8b5' }}><ShieldCheck size={17} /> Role-based secure access</div>
      </section>

      <section className="flex items-center justify-center bg-white p-5 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] font-display font-semibold" style={{ background: '#ffd02f', color: '#1c1c1e' }}>RL</div>
            <div className="font-display font-medium">RuralLearn</div>
          </div>
          <div className="mb-7">
            <p className="eyebrow mb-2">{isTeacher ? 'Teacher portal' : 'Student portal'}</p>
            <h2 className="mt-2 font-display text-3xl font-medium" style={{ color: '#1c1c1e' }}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <p className="mt-2" style={{ color: '#555a6a' }}>{mode === 'login' ? 'Sign in to continue to your classroom.' : `Register as a ${role}.`}</p>
          </div>

          <div className="border bg-white p-6 sm:p-7" style={{ borderColor: '#eef0f3', borderRadius: 16, boxShadow: 'rgba(5, 0, 56, 0.06) 0px 4px 12px 0px' }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div><label className="label">Full name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required /></div>
              )}
              <div><label className="label">Email</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
              <div><label className="label">Password</label><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} placeholder="Minimum 6 characters" required /></div>
              {isTeacher && (
                <div>
                  <label className="label">Teacher access code {mode === 'login' && <span className="font-medium normal-case tracking-normal" style={{ color: '#a5a8b5' }}>(required if this account is still marked student)</span>}</label>
                  <input className="input" value={teacherCode} onChange={(e) => setTeacherCode(e.target.value)} placeholder="College-provided code" required={mode === 'signup'} />
                </div>
              )}
              <button className="btn-primary w-full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={17} /></button>
            </form>

            <div className="mt-6 text-center text-sm" style={{ color: '#555a6a' }}>
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button className="font-semibold underline" style={{ color: '#1c1c1e' }} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </div>
          </div>
          <div className="mt-6 border-t pt-5 text-center text-sm" style={{ borderColor: '#eef0f3', color: '#555a6a' }}>
            {isTeacher ? 'Are you a student?' : 'Are you a teacher?'}{' '}
            <Link className="font-semibold underline" style={{ color: '#1c1c1e' }} to={isTeacher ? '/student/login' : '/teacher/login'}>
              Open {isTeacher ? 'student' : 'teacher'} portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
