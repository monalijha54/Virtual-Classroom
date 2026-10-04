import { BookOpen, CircleUserRound, LayoutDashboard, LogOut, Menu, School, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AppLayout() {
  const { profile, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  if (!profile) return null

  const base = `/${profile.role}`
  const links = [
    { to: base, label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: `${base}/classes`, label: 'My Classes', icon: School, end: false },
    { to: `${base}/profile`, label: 'Profile', icon: CircleUserRound, end: true },
  ]

  const sidebar = (
    <div className="flex h-full flex-col bg-white" style={{ color: '#1c1c1e', borderRight: '1px solid #eef0f3' }}>
      <div className="flex items-center gap-3 border-b px-5 py-5" style={{ borderColor: '#eef0f3' }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-[8px] font-display text-sm font-semibold" style={{ background: '#ffd02f', color: '#1c1c1e' }}>RL</div>
        <div><div className="font-display font-medium leading-tight">RuralLearn</div><div className="text-[11px]" style={{ color: '#6b6f7e' }}>Learn anywhere, grow everywhere</div></div>
      </div>
      <nav className="flex-1 space-y-1.5 p-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition ${isActive ? '' : ''}`}
            style={({ isActive }) => isActive ? { background: '#1c1c1e', color: '#ffffff' } : { color: '#555a6a' }}
          >
            {() => (
              <>
                <Icon size={18} /> {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t p-3" style={{ borderColor: '#eef0f3' }}>
        <div className="mb-3 rounded-[12px] p-3" style={{ background: '#f7f8fa', border: '1px solid #eef0f3' }}>
          <div className="truncate text-sm font-medium" style={{ color: '#1c1c1e' }}>{profile.full_name}</div>
          <div className="mt-0.5 text-xs capitalize" style={{ color: '#6b6f7e' }}>{profile.role}</div>
        </div>
        <button onClick={signOut} className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition" style={{ color: '#555a6a' }}>
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen lg:block">{sidebar}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0" style={{ background: 'rgba(5,0,56,0.4)' }} onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 overflow-hidden rounded-r-[16px] bg-white shadow-2xl">{sidebar}</aside>
          <button className="absolute right-4 top-4 rounded-full bg-white p-2" style={{ color: '#1c1c1e', border: '1px solid #e0e2e8' }} onClick={() => setMobileOpen(false)}><X size={20} /></button>
        </div>
      )}
      <div className="min-w-0" style={{ background: '#fafbfc' }}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/90 px-4 backdrop-blur md:px-6 lg:px-8" style={{ borderColor: '#eef0f3' }}>
          <button className="rounded-full p-2 hover:bg-black/5 lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
          <div className="hidden items-center gap-2 text-sm font-medium sm:flex" style={{ color: '#555a6a' }}><BookOpen size={16} /> Learn • Teach • Grow</div>
          <Link to={`${base}/profile`} aria-label="Profile" className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-white transition hover:bg-black/5" style={{ color: '#1c1c1e', border: '1px solid #e0e2e8' }}>
            <CircleUserRound size={20} />
          </Link>
        </header>
        <main className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
