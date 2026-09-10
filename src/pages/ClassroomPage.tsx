import { Bell, BookOpen, ClipboardList, Copy, Home, Radio, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnnouncementsTab } from '../classroom/AnnouncementsTab'
import { LiveClassTab } from '../classroom/LiveClassTab'
import { NotesTab } from '../classroom/NotesTab'
import { QuizzesTab } from '../classroom/QuizzesTab'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Announcement, Classroom } from '../lib/types'

type Tab = 'overview' | 'announcements' | 'notes' | 'quizzes' | 'live'

export function ClassroomPage() {
  const { classroomId } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({ students: 0, notes: 0, quizzes: 0 })
  const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null)

  useEffect(() => {
    async function load() {
      if (!classroomId || !profile) return
      setLoading(true)
      const { data, error } = await supabase.from('classrooms').select('*').eq('id', classroomId).single()
      if (error || !data) { toast.error('You cannot access this classroom.'); navigate(`/${profile.role}/classes`); return }
      setClassroom(data as Classroom)
      const [{ count: memberCount }, { count: noteCount }, { count: quizCount }, { data: ann }] = await Promise.all([
        supabase.from('class_members').select('*', { count: 'exact', head: true }).eq('classroom_id', classroomId),
        supabase.from('notes').select('*', { count: 'exact', head: true }).eq('classroom_id', classroomId),
        supabase.from('quizzes').select('*', { count: 'exact', head: true }).eq('classroom_id', classroomId),
        supabase.from('announcements').select('*').eq('classroom_id', classroomId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ])
      setCounts({ students: memberCount ?? 0, notes: noteCount ?? 0, quizzes: quizCount ?? 0 })
      setLatestAnnouncement((ann as Announcement | null) ?? null)
      setLoading(false)
    }
    load()
  }, [classroomId, profile, navigate])

  const tabs = useMemo(() => [
    { id: 'overview' as Tab, label: 'Overview', icon: Home },
    { id: 'announcements' as Tab, label: 'Announcements', icon: Bell },
    { id: 'notes' as Tab, label: 'Notes', icon: BookOpen },
    { id: 'quizzes' as Tab, label: 'Quizzes', icon: ClipboardList },
    { id: 'live' as Tab, label: 'Live Class', icon: Radio },
  ], [])

  if (loading) return <div className="py-20 text-center" style={{ color: '#555a6a' }}>Loading classroom…</div>
  if (!classroom || !classroomId || !profile) return null

  function copyCode() { navigator.clipboard.writeText(classroom!.class_code); toast.success('Class code copied') }

  return (
    <div>
      <div className="mb-6 text-sm" style={{ color: '#555a6a' }}><Link className="font-medium underline" style={{ color: '#1c1c1e' }} to={`/${profile.role}/classes`}>My Classes</Link><span className="mx-2">/</span><span>{classroom.name}</span></div>
      <section className="card whiteboard-mockup mb-6 overflow-hidden p-0">
        <div className="board-dots p-6 md:p-7" style={{ background: '#fff8e0' }}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div><p className="eyebrow">{classroom.subject}</p><h1 className="mt-1.5 font-display text-2xl font-medium sm:text-3xl" style={{ color: '#1c1c1e' }}>{classroom.name}</h1><p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: '#555a6a' }}>{classroom.description || 'Class notes, quizzes, announcements and live lessons in one place.'}</p><span className="pill pill-yellow mt-3">Classroom board</span></div>
            {profile.role === 'teacher' && <button onClick={copyCode} className="btn-secondary shrink-0 bg-white"><span>Class code</span><span className="font-mono tracking-widest">{classroom.class_code}</span><Copy size={15} /></button>}
          </div>
        </div>
      </section>

      <div className="tab-rail mb-6 overflow-x-auto"><div className="flex min-w-max gap-2">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition" style={tab === id ? { background: '#1c1c1e', color: '#ffffff' } : { background: '#FFFFFF', color: '#555a6a', border: '1px solid #e0e2e8' }}><Icon size={16} />{label}</button>)}</div></div>

      {tab === 'overview' && <Overview classroom={classroom} counts={counts} latestAnnouncement={latestAnnouncement} isTeacher={profile.role === 'teacher'} onOpenTab={setTab} />}
      {tab === 'announcements' && <AnnouncementsTab classroomId={classroomId} />}
      {tab === 'notes' && <NotesTab classroomId={classroomId} />}
      {tab === 'quizzes' && <QuizzesTab classroomId={classroomId} />}
      {tab === 'live' && <LiveClassTab classroomId={classroomId} classroomName={classroom.name} />}
    </div>
  )
}

function Overview({ classroom, counts, latestAnnouncement, isTeacher, onOpenTab }: { classroom: Classroom; counts: { students: number; notes: number; quizzes: number }; latestAnnouncement: Announcement | null; isTeacher: boolean; onOpenTab: (tab: Tab) => void }) {
  const cards = [
    { label: 'Students', value: counts.students, icon: Users, tint: '#fff4c4' },
    { label: 'Notes', value: counts.notes, icon: BookOpen, tint: '#c3faf5' },
    { label: 'Quizzes', value: counts.quizzes, icon: ClipboardList, tint: '#fde0f0' },
  ]
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-3">{cards.map(({ label, value, icon: Icon, tint }) => <div key={label} className="card flex items-center gap-4 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-[12px]" style={{ background: tint, color: '#1c1c1e' }}><Icon size={20} /></div><div><p className="font-display text-2xl font-medium" style={{ color: '#1c1c1e' }}>{value}</p><p className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: '#6b6f7e' }}>{label}</p></div></div>)}</div><div className="grid gap-5 lg:grid-cols-2"><div className="card p-5"><div className="flex items-center justify-between"><h2 className="font-display font-medium" style={{ color: '#1c1c1e' }}>Latest announcement</h2><button className="text-sm font-medium underline" style={{ color: '#1c1c1e' }} onClick={() => onOpenTab('announcements')}>View all</button></div>{latestAnnouncement ? <><p className="mt-4 text-sm leading-6" style={{ color: '#2c2c34' }}>{latestAnnouncement.message}</p><p className="mt-3 text-xs" style={{ color: '#a5a8b5' }}>{new Date(latestAnnouncement.created_at).toLocaleString()}</p></> : <p className="mt-4 text-sm" style={{ color: '#555a6a' }}>No announcements yet.</p>}</div><div className="card p-5"><h2 className="font-display font-medium" style={{ color: '#1c1c1e' }}>Quick access</h2><div className="mt-4 grid grid-cols-2 gap-3"><button className="btn-secondary" onClick={() => onOpenTab('notes')}><BookOpen size={16} />Notes</button><button className="btn-secondary" onClick={() => onOpenTab('quizzes')}><ClipboardList size={16} />Quizzes</button><button className="btn-primary col-span-2" onClick={() => onOpenTab('live')}><Radio size={16} />{isTeacher ? 'Start / open live class' : 'Check live class'}</button></div></div></div><p className="text-xs" style={{ color: '#a5a8b5' }}>Created {new Date(classroom.created_at).toLocaleDateString()}</p></div>
}
