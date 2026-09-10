import { ArrowRight, BookOpen, ClipboardCheck, LogIn, Plus, School, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Classroom } from '../lib/types'
import { StatCard } from '../components/BrandBits'
import { ClassroomCard } from '../components/ClassroomCard'
import { CreateClassModal, JoinClassModal } from './ClassesPage'

export function DashboardPage() {
  const { profile } = useAuth()
  const [classes, setClasses] = useState<Classroom[]>([])
  const [studentCount, setStudentCount] = useState(0)
  const [quizCount, setQuizCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)

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

  useEffect(() => { load() }, [profile])

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
        <h1 className="mt-2 font-display text-3xl font-medium" style={{ color: '#1c1c1e' }}>Welcome, {profile.full_name.split(' ')[0]}</h1>
        <p className="mt-2" style={{ color: '#555a6a' }}>{isTeacher ? 'Manage your classes and student learning.' : 'Continue learning from your classrooms.'}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon }, i) => (
          <StatCard key={label} index={i} label={label} value={loading ? '—' : value} icon={icon} />
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="font-display text-xl font-medium" style={{ color: '#1c1c1e' }}>My Classes</h2><p className="mt-1 text-sm" style={{ color: '#555a6a' }}>Your recent classrooms <span className="pill pill-yellow ml-1">{classes.length}</span></p></div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/${profile.role}/classes`} className="btn-secondary">View all <ArrowRight size={16} /></Link>
          {isTeacher ? (
            <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus size={17} />New classroom</button>
          ) : (
            <button className="btn-primary" onClick={() => setShowJoin(true)}><LogIn size={17} />Join class</button>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {!loading && classes.length === 0 && (
          <div className="card-warm col-span-full p-10 text-center">
            <School className="mx-auto" size={36} style={{ color: '#8e91a0' }} />
            <h3 className="mt-4 font-display font-medium" style={{ color: '#1c1c1e' }}>No classrooms yet</h3>
            <p className="mt-1 text-sm" style={{ color: '#555a6a' }}>{isTeacher ? 'Create your first classroom to get started.' : 'Join a classroom using the code given by your teacher.'}</p>
            <div className="mt-5 flex justify-center">
              {isTeacher ? (
                <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus size={17} />New classroom</button>
              ) : (
                <button className="btn-primary" onClick={() => setShowJoin(true)}><LogIn size={17} />Join class</button>
              )}
            </div>
          </div>
        )}
        {classes.slice(0, 6).map((classroom, i) => (
          <ClassroomCard key={classroom.id} classroom={classroom} index={i} />
        ))}
      </div>

      {showCreate && profile.role === 'teacher' && <CreateClassModal onClose={() => setShowCreate(false)} onCreated={load} teacherId={profile.id} />}
      {showJoin && profile.role === 'student' && <JoinClassModal onClose={() => setShowJoin(false)} onJoined={load} />}
    </div>
  )
}
