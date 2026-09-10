import { ArrowRight, BookOpen, ClipboardCheck, School, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Classroom } from '../lib/types'
import { StatCard } from '../components/BrandBits'
import { accentFor } from '../components/DecorativeShape'

export function DashboardPage() {
  const { profile } = useAuth()
  const [classes, setClasses] = useState<Classroom[]>([])
  const [studentCount, setStudentCount] = useState(0)
  const [quizCount, setQuizCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!profile) return
      setLoading(true)
      let classRows: Classroom[] = []
      if (profile.role === 'teacher') {
        const { data } = await supabase.from('classrooms').select('*').eq('teacher_id', profile.id).order('created_at', { ascending: false })
        classRows = (data ?? []) as Classroom[]
      } else {
        const { data: memberships } = await supabase.from('class_members').select('classroom_id').eq('student_id', profile.id)
        const ids = (memberships ?? []).map((m: { classroom_id: string }) => m.classroom_id)
        if (ids.length) {
          const { data } = await supabase.from('classrooms').select('*').in('id', ids).order('created_at', { ascending: false })
          classRows = (data ?? []) as Classroom[]
        }
      }
      setClasses(classRows)

      if (classRows.length) {
        const ids = classRows.map((c) => c.id)
        if (profile.role === 'teacher') {
          const { count } = await supabase.from('class_members').select('*', { count: 'exact', head: true }).in('classroom_id', ids)
          setStudentCount(count ?? 0)
        }
        const { count: quizzes } = await supabase.from('quizzes').select('*', { count: 'exact', head: true }).in('classroom_id', ids)
        setQuizCount(quizzes ?? 0)
      }
      setLoading(false)
    }
    load()
  }, [profile])

  if (!profile) return null
  const isTeacher = profile.role === 'teacher'
  const stats = isTeacher
    ? [
        { label: 'Classes', value: classes.length, icon: <School size={21} /> },
        { label: 'Students', value: studentCount, icon: <Users size={21} /> },
        { label: 'Quizzes', value: quizCount, icon: <ClipboardCheck size={21} /> },
      ]
    : [
        { label: 'Joined classes', value: classes.length, icon: <School size={21} /> },
        { label: 'Available quizzes', value: quizCount, icon: <ClipboardCheck size={21} /> },
        { label: 'Learning space', value: 'Active', icon: <BookOpen size={21} /> },
      ]

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">{isTeacher ? 'Teacher dashboard' : 'Student dashboard'}</p>
        <h1 className="h-display mt-2 text-4xl sm:text-5xl" style={{ color: '#18130F' }}>Welcome, {profile.full_name.split(' ')[0]}</h1>
        <p className="mt-2" style={{ color: '#6E6153' }}>{isTeacher ? 'Manage your classes and student learning.' : 'Continue learning from your classrooms.'}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon }, i) => (
          <StatCard key={label} index={i} label={label} value={loading ? '—' : value} icon={icon} />
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <div><h2 className="h-section text-2xl" style={{ color: '#18130F' }}>My Classes</h2><p className="mt-1 text-sm" style={{ color: '#6E6153' }}>Your recent classrooms</p></div>
        <Link to={`/${profile.role}/classes`} className="btn-secondary">View all <ArrowRight size={16} /></Link>
      </div>

      <div className="stagger mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {!loading && classes.length === 0 && (
          <div className="card-warm col-span-full p-10 text-center">
            <School className="mx-auto" size={36} style={{ color: '#A2907A' }} />
            <h3 className="mt-4 font-display font-bold" style={{ color: '#18130F' }}>No classrooms yet</h3>
            <p className="mt-1 text-sm" style={{ color: '#6E6153' }}>{isTeacher ? 'Create your first classroom from My Classes.' : 'Join a classroom using the code given by your teacher.'}</p>
          </div>
        )}
        {classes.slice(0, 6).map((classroom, i) => (
          <Link key={classroom.id} to={`/class/${classroom.id}`} className="card group overflow-hidden transition hover:-translate-y-1">
            <div className="h-2.5" style={{ background: accentFor(i) }} />
            <div className="p-5">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full" style={{ background: '#18130F', color: '#FAF6ED' }}><BookOpen size={21} /></div>
              <p className="eyebrow">{classroom.subject}</p>
              <h3 className="mt-1 font-display text-lg font-bold" style={{ color: '#18130F' }}>{classroom.name}</h3>
              <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5" style={{ color: '#6E6153' }}>{classroom.description || 'Open the classroom to view notes, quizzes and live sessions.'}</p>
              <div className="mt-5 flex items-center justify-between text-sm font-semibold"><span style={{ color: '#A79C8C' }}>{isTeacher ? `Code: ${classroom.class_code}` : 'Open classroom'}</span><ArrowRight size={16} className="transition group-hover:translate-x-1" /></div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
