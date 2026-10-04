import { CircleUserRound, LogOut, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function ProfilePage() {
  const { profile, signOut } = useAuth()
  if (!profile) return null

  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow mb-2">Account</p>
      <h1 className="font-display text-3xl font-medium" style={{ color: '#1c1c1e' }}>Profile</h1>

      <section className="card whiteboard-mockup mt-6 overflow-hidden p-0">
        <div className="board-dots flex items-center gap-4 p-6" style={{ background: '#fff8e0' }}>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] bg-white" style={{ color: '#1c1c1e', border: '1px solid #eef0f3' }}>
            <CircleUserRound size={28} />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-display text-xl font-medium" style={{ color: '#1c1c1e' }}>{profile.full_name}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="pill pill-yellow capitalize">{profile.role}</span>
              <span className="pill pill-purple">{profile.role === 'teacher' ? 'Teacher portal' : 'Student portal'}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="card mt-4 p-6">
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3">
            <CircleUserRound size={16} style={{ color: '#6b6f7e' }} />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: '#6b6f7e' }}>Full name</p>
              <p className="mt-0.5 font-medium" style={{ color: '#1c1c1e' }}>{profile.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={16} style={{ color: '#6b6f7e' }} />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: '#6b6f7e' }}>Email</p>
              <p className="mt-0.5 font-medium" style={{ color: '#1c1c1e' }}>{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck size={16} style={{ color: '#6b6f7e' }} />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: '#6b6f7e' }}>Member since</p>
              <p className="mt-0.5 font-medium" style={{ color: '#1c1c1e' }}>{new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 border-t pt-5" style={{ borderColor: '#eef0f3' }}>
          <button onClick={signOut} className="btn-secondary"><LogOut size={16} />Sign out</button>
        </div>
      </section>
    </div>
  )
}
