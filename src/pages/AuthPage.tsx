import { ArrowRight, GraduationCap, KeyRound, LogOut, School, ShieldCheck } from 'lucide-react'
import { FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../lib/types'
import { DecorativeShape } from '../components/DecorativeShape'

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
      <div className="flex min-h-screen items-center justify-center p-5" style={{ background: '#FAF6ED' }}>
        <div className="w-full max-w-md border bg-white p-7 sm:p-8" style={{ borderRadius: 20, borderColor: '#E4DBCB' }}>
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: '#F2C230', color: '#18130F' }}>
            <KeyRound size={24} />
          </div>
          <p className="eyebrow mb-2">Teacher portal</p>
          <h1 className="h-section text-2xl" style={{ color: '#18130F' }}>Activate teacher access</h1>
          <p className="mt-2 text-sm leading-6" style={{ color: '#6E6153' }}>
            This account currently has the default student role. Enter the teacher access code once to upgrade it.
          </p>

          <div className="mt-5 rounded-[12px] p-4 text-sm" style={{ background: '#EDE1C7' }}>
            <div className="font-semibold" style={{ color: '#18130F' }}>Signed in as {profile.full_name}</div>
            <div className="mt-1" style={{ color: '#6E6153' }}>{profile.email}</div>
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
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition hover:bg-black/5"
            style={{ color: '#6E6153' }}
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
    <div className="grid min-h-screen lg:grid-cols-2" style={{ background: '#FAF6ED' }}>
      <section className="relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between" style={{ background: '#211C17', color: '#F5EFE4' }}>
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full font-display text-lg font-extrabold" style={{ background: '#F2C230', color: '#18130F' }}>RL</div>
          <div><div className="font-display text-lg font-extrabold">RuralLearn</div><div className="text-xs" style={{ color: '#B7ACA0' }}>Learn anywhere, grow everywhere</div></div>
        </Link>
        <div className="max-w-lg">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold" style={{ background: isTeacher ? '#F2C230' : '#CBDA2E', color: '#18130F' }}>
            {isTeacher ? <School size={15} /> : <GraduationCap size={15} />}
            {isTeacher ? 'Teacher Portal' : 'Student Portal'}
          </div>
          <h1 className="h-display text-5xl">Learn anywhere, grow everywhere.</h1>
          <p className="mt-5 text-lg leading-8" style={{ color: '#B7ACA0' }}>Simple online classes, notes, quizzes and live lessons — built for rural learners.</p>
          <div className="mt-8 flex items-end gap-3">
            <DecorativeShape kind="sunburst" color="#F2C230" size={52} rotate={-8} />
            <DecorativeShape kind="capsule" color="#6478E0" size={24} rotate={-10} />
            <DecorativeShape kind="circle" color="#CBDA2E" size={34} />
            <DecorativeShape kind="triangle" color="#C7B79C" size={30} rotate={8} />
            <DecorativeShape kind="squiggle" color="#F5EFE4" size={30} />
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: '#B7ACA0' }}><ShieldCheck size={17} /> Role-based secure access</div>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-full font-display font-extrabold" style={{ background: '#18130F', color: '#FAF6ED' }}>RL</div>
            <div className="font-display font-extrabold">RuralLearn</div>
          </div>
          <div className="mb-7">
            <p className="eyebrow mb-2">{isTeacher ? 'Teacher portal' : 'Student portal'}</p>
            <h2 className="h-section text-4xl" style={{ color: '#18130F' }}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <p className="mt-2" style={{ color: '#6E6153' }}>{mode === 'login' ? 'Sign in to continue to your classroom.' : `Register as a ${role}.`}</p>
          </div>

          <div className="border p-6 sm:p-7" style={{ background: '#EDE1C7', borderColor: '#E4DBCB', borderRadius: 20 }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div><label className="label">Full name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required /></div>
              )}
              <div><label className="label">Email</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
              <div><label className="label">Password</label><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} placeholder="Minimum 6 characters" required /></div>
              {isTeacher && (
                <div>
                  <label className="label">Teacher access code {mode === 'login' && <span className="font-medium normal-case tracking-normal" style={{ color: '#A79C8C' }}>(required if this account is still marked student)</span>}</label>
                  <input className="input" value={teacherCode} onChange={(e) => setTeacherCode(e.target.value)} placeholder="College-provided code" required={mode === 'signup'} />
                </div>
              )}
              <button className={isTeacher && mode === 'signup' ? 'btn-accent w-full' : 'btn-primary w-full'} disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={17} /></button>
            </form>

            <div className="mt-6 text-center text-sm" style={{ color: '#6E6153' }}>
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button className="font-bold underline" style={{ color: '#18130F' }} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </div>
          </div>
          <div className="mt-6 border-t pt-5 text-center text-sm" style={{ borderColor: '#E4DBCB', color: '#6E6153' }}>
            {isTeacher ? 'Are you a student?' : 'Are you a teacher?'}{' '}
            <Link className="font-bold underline" style={{ color: '#18130F' }} to={isTeacher ? '/student/login' : '/teacher/login'}>
              Open {isTeacher ? 'student' : 'teacher'} portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
