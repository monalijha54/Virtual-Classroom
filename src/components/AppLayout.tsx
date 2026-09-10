import { BookOpen, LayoutDashboard, LogOut, Menu, School, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AVATAR_FILLS = ['#F2C230', '#F23DAE', '#CBDA2E', '#6478E0']

export function AppLayout() {
  const { profile, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  if (!profile) return null

  const base = `/${profile.role}`
  const links = [
    { to: base, label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: `${base}/classes`, label: 'My Classes', icon: School, end: false },
  ]

  const avatarFill = AVATAR_FILLS[profile.full_name.length % AVATAR_FILLS.length]

  const sidebar = (
    <div className="flex h-full flex-col" style={{ background: '#211C17', color: '#F5EFE4' }}>
      <div className="flex items-center gap-3 border-b px-5 py-5" style={{ borderColor: 'rgba(245,239,228,0.12)' }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full font-display text-lg font-extrabold" style={{ background: '#F2C230', color: '#18130F' }}>RL</div>
        <div><div className="font-display font-extrabold leading-tight">RuralLearn</div><div className="text-[11px]" style={{ color: '#B7ACA0' }}>Learn anywhere, grow everywhere</div></div>
      </div>
      <nav className="flex-1 space-y-1.5 p-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `relative flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-semibold transition ${isActive ? '' : 'hover:bg-white/5'}`}
            style={({ isActive }) => isActive ? { background: '#FAF6ED', color: '#18130F' } : { color: '#B7ACA0' }}
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-1/2 h-6 w-1.5 -translate-y-1/2 rounded-full" style={{ background: '#F23DAE' }} />}
                <Icon size={18} /> {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t p-3" style={{ borderColor: 'rgba(245,239,228,0.12)' }}>
        <div className="mb-3 rounded-[12px] p-3" style={{ background: 'rgba(250,246,237,0.06)' }}>
          <div className="truncate text-sm font-semibold" style={{ color: '#F5EFE4' }}>{profile.full_name}</div>
          <div className="mt-0.5 text-xs capitalize" style={{ color: '#B7ACA0' }}>{profile.role}</div>
        </div>
        <button onClick={signOut} className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-semibold transition hover:bg-white/5" style={{ color: '#B7ACA0' }}>
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]" style={{ background: '#FAF6ED' }}>
      <aside className="sticky top-0 hidden h-screen lg:block">{sidebar}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0" style={{ background: 'rgba(24,19,15,0.5)' }} onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 overflow-hidden rounded-r-[20px] shadow-2xl">{sidebar}</aside>
          <button className="absolute right-4 top-4 rounded-full bg-white p-2" style={{ color: '#18130F' }} onClick={() => setMobileOpen(false)}><X size={20} /></button>
        </div>
      )}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur md:px-6 lg:px-8" style={{ background: 'rgba(250,246,237,0.92)', borderColor: '#E4DBCB' }}>
          <button className="rounded-full p-2 hover:bg-black/5 lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
          <div className="hidden items-center gap-2 text-sm font-semibold sm:flex" style={{ color: '#6E6153' }}><BookOpen size={16} /> Learn • Teach • Grow</div>
          <div className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold" style={{ background: avatarFill, color: '#18130F' }}>
            {profile.full_name.slice(0, 1).toUpperCase()}
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
