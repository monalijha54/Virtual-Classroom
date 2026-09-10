import { Copy, LogIn, Plus, Search } from 'lucide-react'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Modal } from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Classroom } from '../lib/types'
import { ClassroomCard } from '../components/ClassroomCard'

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function ClassesPage() {
  const { profile } = useAuth()
  const [classes, setClasses] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [search, setSearch] = useState('')

  async function loadClasses() {
    if (!profile) return
    setLoading(true)
    if (profile.role === 'teacher') {
      const { data, error } = await supabase.from('classrooms').select('*').eq('teacher_id', profile.id).order('created_at', { ascending: false })
      if (error) toast.error(error.message)
      setClasses((data ?? []) as Classroom[])
    } else {
      const { data: memberships, error } = await supabase.from('class_members').select('classroom_id').eq('student_id', profile.id)
      if (error) toast.error(error.message)
      const ids = (memberships ?? []).map((m: { classroom_id: string }) => m.classroom_id)
      if (!ids.length) setClasses([])
      else {
        const { data } = await supabase.from('classrooms').select('*').in('id', ids).order('created_at', { ascending: false })
        setClasses((data ?? []) as Classroom[])
      }
    }
    setLoading(false)
  }

  useEffect(() => { loadClasses() }, [profile])
  const filtered = useMemo(() => classes.filter((c) => `${c.name} ${c.subject}`.toLowerCase().includes(search.toLowerCase())), [classes, search])
  if (!profile) return null

  return (
    <div>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="eyebrow flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full" style={{ background: '#F2C230' }} />Classrooms</p><h1 className="h-display mt-1 text-4xl" style={{ color: '#18130F' }}>My Classes</h1><p className="mt-2" style={{ color: '#6E6153' }}>{profile.role === 'teacher' ? 'Create and manage your teaching spaces.' : 'Join and access your learning spaces.'}</p></div>
        <button className={profile.role === 'teacher' ? 'btn-accent' : 'btn-primary'} onClick={() => profile.role === 'teacher' ? setShowCreate(true) : setShowJoin(true)}>{profile.role === 'teacher' ? <Plus size={17} /> : <LogIn size={17} />}{profile.role === 'teacher' ? 'Create classroom' : 'Join classroom'}</button>
      </div>

      <div className="relative mb-5 max-w-md"><Search size={17} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A79C8C' }} /><input className="input input-has-left-icon" placeholder="Search classes…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>

      {loading ? <div className="py-16 text-center" style={{ color: '#6E6153' }}>Loading classrooms…</div> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.length === 0 && <div className="card-warm col-span-full p-12 text-center" style={{ color: '#6E6153' }}>No classrooms found.</div>}
          {filtered.map((classroom, i) => (
            <ClassroomCard key={classroom.id} classroom={classroom} index={i} />
          ))}
        </div>
      )}

      {showCreate && <CreateClassModal onClose={() => setShowCreate(false)} onCreated={loadClasses} teacherId={profile.id} />}
      {showJoin && <JoinClassModal onClose={() => setShowJoin(false)} onJoined={loadClasses} />}
    </div>
  )
}

export function CreateClassModal({ onClose, onCreated, teacherId }: { onClose: () => void; onCreated: () => void; teacherId: string }) {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true)
    const { error } = await supabase.from('classrooms').insert({ name: name.trim(), subject: subject.trim(), description: description.trim(), teacher_id: teacherId, class_code: makeCode() })
    setBusy(false)
    if (error) return toast.error(error.message)
    toast.success('Classroom created'); onCreated(); onClose()
  }
  return <Modal title="Create classroom" onClose={onClose}><form className="space-y-4" onSubmit={submit}><div><label className="label">Class name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="BCA Semester 4" required /></div><div><label className="label">Subject</label><input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Data Structures" required /></div><div><label className="label">Description</label><textarea className="input min-h-24 resize-y" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will students learn?" /></div><div className="flex justify-end gap-2 pt-2"><button type="button" className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-accent" disabled={busy}>{busy ? 'Creating…' : 'Create classroom'}</button></div></form></Modal>
}

export function JoinClassModal({ onClose, onJoined }: { onClose: () => void; onJoined: () => void }) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true)
    const { error } = await supabase.rpc('join_classroom_by_code', { p_code: code.trim() })
    setBusy(false)
    if (error) return toast.error(error.message)
    toast.success('Joined classroom'); onJoined(); onClose()
  }
  return <Modal title="Join classroom" onClose={onClose}><form onSubmit={submit}><p className="mb-4 text-sm" style={{ color: '#6E6153' }}>Enter the 6-character code shared by your teacher.</p><label className="label">Class code</label><div className="relative"><input className="input input-has-right-icon font-mono uppercase tracking-widest" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABC123" required /><Copy size={16} aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#A79C8C' }} /></div><button className="btn-primary mt-5 w-full" disabled={busy}>{busy ? 'Joining…' : 'Join classroom'}</button></form></Modal>
}
