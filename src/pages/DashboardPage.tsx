import { ArrowRight, BookOpen, ClipboardCheck, School, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Classroom } from '../lib/types'

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
        { label: 'Classes', value: classes.length, icon: School },
        { label: 'Students', value: studentCount, icon: Users },
        { label: 'Quizzes', value: quizCount, icon: ClipboardCheck },
      ]
    : [
        { label: 'Joined classes', value: classes.length, icon: School },
        { label: 'Available quizzes', value: quizCount, icon: ClipboardCheck },
        { label: 'Learning space', value: 'Active', icon: BookOpen },
      ]

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-indigo-600">{isTeacher ? 'Teacher dashboard' : 'Student dashboard'}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Welcome, {profile.full_name.split(' ')[0]}</h1>
        <p className="mt-2 text-slate-500">{isTeacher ? 'Manage your classes and student learning.' : 'Continue learning from your classrooms.'}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{loading ? '—' : value}</p></div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon size={21} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-slate-900">My Classes</h2><p className="mt-1 text-sm text-slate-500">Your recent classrooms</p></div>
        <Link to={`/${profile.role}/classes`} className="btn-secondary">View all <ArrowRight size={16} /></Link>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {!loading && classes.length === 0 && (
          <div className="card col-span-full p-10 text-center">
            <School className="mx-auto text-slate-300" size={36} />
            <h3 className="mt-4 font-bold text-slate-800">No classrooms yet</h3>
            <p className="mt-1 text-sm text-slate-500">{isTeacher ? 'Create your first classroom from My Classes.' : 'Join a classroom using the code given by your teacher.'}</p>
          </div>
        )}
        {classes.slice(0, 6).map((classroom) => (
          <Link key={classroom.id} to={`/class/${classroom.id}`} className="card group p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700"><BookOpen size={21} /></div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">{classroom.subject}</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900 group-hover:text-indigo-700">{classroom.name}</h3>
            <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">{classroom.description || 'Open the classroom to view notes, quizzes and live sessions.'}</p>
            <div className="mt-5 flex items-center justify-between text-sm"><span className="text-slate-400">{isTeacher ? `Code: ${classroom.class_code}` : 'Open classroom'}</span><ArrowRight size={16} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600" /></div>
          </Link>
        ))}
      </div>
    </div>
  )
}
