import { BookOpen, GraduationCap, LayoutDashboard, LogOut, Menu, School, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AppLayout() {
  const { profile, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  if (!profile) return null

  const base = `/${profile.role}`
  const links = [
    { to: base, label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: `${base}/classes`, label: 'My Classes', icon: School, end: false },
  ]

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-950 text-white">
      <div className="flex h-18 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500"><GraduationCap size={22} /></div>
        <div><div className="font-bold">Classly</div><div className="text-xs text-slate-400">Virtual Classroom</div></div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <div className="mb-3 rounded-xl bg-white/5 p-3">
          <div className="truncate text-sm font-semibold">{profile.full_name}</div>
          <div className="mt-0.5 text-xs capitalize text-slate-400">{profile.role}</div>
        </div>
        <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 hidden h-screen lg:block">{sidebar}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 shadow-2xl">{sidebar}</aside>
          <button className="absolute right-4 top-4 rounded-xl bg-white p-2 text-slate-700" onClick={() => setMobileOpen(false)}><X size={20} /></button>
        </div>
      )}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6 lg:px-8">
          <button className="rounded-xl p-2 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
          <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex"><BookOpen size={16} /> Learn • Teach • Grow</div>
          <div className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
            {profile.full_name.slice(0, 1).toUpperCase()}
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
