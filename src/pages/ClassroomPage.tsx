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
import { DecorativeShape } from '../components/DecorativeShape'

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

  if (loading) return <div className="py-20 text-center" style={{ color: '#6E6153' }}>Loading classroom…</div>
  if (!classroom || !classroomId || !profile) return null

  function copyCode() { navigator.clipboard.writeText(classroom!.class_code); toast.success('Class code copied') }

  return (
    <div>
      <div className="mb-6 text-sm" style={{ color: '#6E6153' }}><Link className="font-semibold underline" style={{ color: '#18130F' }} to={`/${profile.role}/classes`}>My Classes</Link><span className="mx-2">/</span><span>{classroom.name}</span></div>
      <section className="relative mb-6 overflow-hidden" style={{ background: '#211C17', color: '#F5EFE4', borderRadius: 32 }}>
        <div className="p-6 md:p-8">
          <div className="pointer-events-none absolute -right-4 -top-4 hidden items-end gap-2 sm:flex">
            <DecorativeShape kind="sunburst" color="#F2C230" size={56} rotate={-10} />
            <DecorativeShape kind="capsule" color="#6478E0" size={24} rotate={-12} />
            <DecorativeShape kind="circle" color="#CBDA2E" size={36} />
          </div>
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="eyebrow" style={{ color: '#F2C230' }}>{classroom.subject}</p><h1 className="h-display mt-2 text-3xl sm:text-4xl">{classroom.name}</h1><p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: '#B7ACA0' }}>{classroom.description || 'Class notes, quizzes, announcements and live lessons in one place.'}</p></div>
            {profile.role === 'teacher' && <button onClick={copyCode} className="flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition hover:brightness-95" style={{ background: '#F2C230', color: '#18130F' }}><span>Class code</span><span className="font-mono tracking-widest">{classroom.class_code}</span><Copy size={15} /></button>}
          </div>
        </div>
      </section>

      <div className="tab-rail mb-6 overflow-x-auto"><div className="flex min-w-max gap-2">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition" style={tab === id ? { background: '#18130F', color: '#FAF6ED' } : { background: '#FFFFFF', color: '#6E6153', border: '1px solid #E4DBCB' }}><Icon size={16} />{label}</button>)}</div></div>

      {tab === 'overview' && <Overview classroom={classroom} counts={counts} latestAnnouncement={latestAnnouncement} isTeacher={profile.role === 'teacher'} onOpenTab={setTab} />}
      {tab === 'announcements' && <AnnouncementsTab classroomId={classroomId} />}
      {tab === 'notes' && <NotesTab classroomId={classroomId} />}
      {tab === 'quizzes' && <QuizzesTab classroomId={classroomId} />}
      {tab === 'live' && <LiveClassTab classroomId={classroomId} classroomName={classroom.name} />}
    </div>
  )
}

function Overview({ classroom, counts, latestAnnouncement, isTeacher, onOpenTab }: { classroom: Classroom; counts: { students: number; notes: number; quizzes: number }; latestAnnouncement: Announcement | null; isTeacher: boolean; onOpenTab: (tab: Tab) => void }) {
  const fills = ['#C7B79C', '#F2C230', '#CBDA2E']
  const cards = [
    { label: 'Students', value: counts.students, icon: Users },
    { label: 'Notes', value: counts.notes, icon: BookOpen },
    { label: 'Quizzes', value: counts.quizzes, icon: ClipboardList },
  ]
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-3">{cards.map(({ label, value, icon: Icon }, i) => <div key={label} className="flex items-center gap-4 rounded-[20px] border p-5" style={{ background: fills[i % fills.length], borderColor: '#E4DBCB' }}><div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: '#18130F', color: '#FAF6ED' }}><Icon size={20} /></div><div><p className="font-display text-2xl font-extrabold" style={{ color: '#18130F' }}>{value}</p><p className="text-[12px] font-bold uppercase tracking-[0.08em]" style={{ color: '#18130F' }}>{label}</p></div></div>)}</div><div className="grid gap-5 lg:grid-cols-2"><div className="card p-5"><div className="flex items-center justify-between"><h2 className="font-display font-bold" style={{ color: '#18130F' }}>Latest announcement</h2><button className="text-sm font-bold underline" style={{ color: '#18130F' }} onClick={() => onOpenTab('announcements')}>View all</button></div>{latestAnnouncement ? <><p className="mt-4 text-sm leading-6" style={{ color: '#2B241E' }}>{latestAnnouncement.message}</p><p className="mt-3 text-xs" style={{ color: '#A79C8C' }}>{new Date(latestAnnouncement.created_at).toLocaleString()}</p></> : <p className="mt-4 text-sm" style={{ color: '#6E6153' }}>No announcements yet.</p>}</div><div className="card p-5"><h2 className="font-display font-bold" style={{ color: '#18130F' }}>Quick access</h2><div className="mt-4 grid grid-cols-2 gap-3"><button className="btn-secondary" onClick={() => onOpenTab('notes')}><BookOpen size={16} />Notes</button><button className="btn-secondary" onClick={() => onOpenTab('quizzes')}><ClipboardList size={16} />Quizzes</button><button className="btn-primary col-span-2" onClick={() => onOpenTab('live')}><Radio size={16} />{isTeacher ? 'Start / open live class' : 'Check live class'}</button></div></div></div><p className="text-xs" style={{ color: '#A79C8C' }}>Created {new Date(classroom.created_at).toLocaleDateString()}</p></div>
}
