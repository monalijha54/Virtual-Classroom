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
import type { Announcement, Classroom, Note, Quiz } from '../lib/types'

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

  if (loading) return <div className="py-20 text-center text-slate-500">Loading classroom…</div>
  if (!classroom || !classroomId || !profile) return null

  function copyCode() { navigator.clipboard.writeText(classroom!.class_code); toast.success('Class code copied') }

  return (
    <div>
      <div className="mb-6 text-sm text-slate-500"><Link className="hover:text-indigo-600" to={`/${profile.role}/classes`}>My Classes</Link><span className="mx-2">/</span><span className="text-slate-700">{classroom.name}</span></div>
      <section className="mb-6 overflow-hidden rounded-2xl bg-slate-950 text-white shadow-sm">
        <div className="bg-gradient-to-r from-indigo-600/30 to-violet-600/20 p-6 md:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-300">{classroom.subject}</p><h1 className="mt-2 text-3xl font-bold">{classroom.name}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{classroom.description || 'Class notes, quizzes, announcements and live lessons in one place.'}</p></div>
            {profile.role === 'teacher' && <button onClick={copyCode} className="flex shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/15"><span className="text-slate-300">Class code</span><span className="font-mono tracking-widest">{classroom.class_code}</span><Copy size={15} /></button>}
          </div>
        </div>
      </section>

      <div className="mb-6 overflow-x-auto border-b border-slate-200"><div className="flex min-w-max gap-1">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${tab === id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}><Icon size={16} />{label}</button>)}</div></div>

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
    { label: 'Students', value: counts.students, icon: Users },
    { label: 'Notes', value: counts.notes, icon: BookOpen },
    { label: 'Quizzes', value: counts.quizzes, icon: ClipboardList },
  ]
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-3">{cards.map(({ label, value, icon: Icon }) => <div key={label} className="card flex items-center gap-4 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon size={20} /></div><div><p className="text-2xl font-bold text-slate-900">{value}</p><p className="text-sm text-slate-500">{label}</p></div></div>)}</div><div className="grid gap-5 lg:grid-cols-2"><div className="card p-5"><div className="flex items-center justify-between"><h2 className="font-bold text-slate-900">Latest announcement</h2><button className="text-sm font-semibold text-indigo-600" onClick={() => onOpenTab('announcements')}>View all</button></div>{latestAnnouncement ? <><p className="mt-4 text-sm leading-6 text-slate-700">{latestAnnouncement.message}</p><p className="mt-3 text-xs text-slate-400">{new Date(latestAnnouncement.created_at).toLocaleString()}</p></> : <p className="mt-4 text-sm text-slate-500">No announcements yet.</p>}</div><div className="card p-5"><h2 className="font-bold text-slate-900">Quick access</h2><div className="mt-4 grid grid-cols-2 gap-3"><button className="btn-secondary" onClick={() => onOpenTab('notes')}><BookOpen size={16} />Notes</button><button className="btn-secondary" onClick={() => onOpenTab('quizzes')}><ClipboardList size={16} />Quizzes</button><button className="btn-secondary col-span-2" onClick={() => onOpenTab('live')}><Radio size={16} />{isTeacher ? 'Start / open live class' : 'Check live class'}</button></div></div></div><p className="text-xs text-slate-400">Created {new Date(classroom.created_at).toLocaleDateString()}</p></div>
}
