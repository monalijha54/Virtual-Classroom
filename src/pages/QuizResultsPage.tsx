import { ArrowLeft, BarChart3, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Quiz } from '../lib/types'

type AttemptRow = {
  id: string
  student_id: string
  score: number
  total_marks: number
  submitted_at: string
  profiles: { full_name: string; email: string } | { full_name: string; email: string }[] | null
}

export function QuizResultsPage() {
  const { quizId } = useParams()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [attempts, setAttempts] = useState<AttemptRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!quizId) return
      const { data: quizData, error } = await supabase.from('quizzes').select('*').eq('id', quizId).single()
      if (error || !quizData) { toast.error('Quiz not found.'); setLoading(false); return }
      setQuiz(quizData as Quiz)
      const { data, error: attemptsError } = await supabase.from('quiz_attempts').select('id, student_id, score, total_marks, submitted_at, profiles!quiz_attempts_student_id_fkey(full_name,email)').eq('quiz_id', quizId).order('submitted_at', { ascending: false })
      if (attemptsError) toast.error(attemptsError.message)
      setAttempts((data ?? []) as unknown as AttemptRow[])
      setLoading(false)
    }
    load()
  }, [quizId])

  const average = useMemo(() => {
    if (!attempts.length) return 0
    return Math.round(attempts.reduce((sum, a) => sum + (a.total_marks ? a.score / a.total_marks * 100 : 0), 0) / attempts.length)
  }, [attempts])

  if (loading) return <div className="py-20 text-center text-slate-500">Loading results…</div>
  if (!quiz) return null

  return (
    <div>
      <Link to={`/class/${quiz.classroom_id}`} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600"><ArrowLeft size={16} />Back to classroom</Link>
      <div className="mb-7"><p className="text-sm font-semibold text-indigo-600">Quiz results</p><h1 className="mt-1 text-3xl font-bold text-slate-900">{quiz.title}</h1><p className="mt-2 text-slate-500">See every student's submitted result.</p></div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3"><div className="card p-5"><p className="text-sm text-slate-500">Submissions</p><div className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900"><Users size={21} className="text-indigo-600" />{attempts.length}</div></div><div className="card p-5"><p className="text-sm text-slate-500">Class average</p><div className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900"><BarChart3 size={21} className="text-indigo-600" />{average}%</div></div><div className="card p-5"><p className="text-sm text-slate-500">Status</p><p className="mt-2 text-2xl font-bold text-slate-900">{quiz.published ? 'Published' : 'Draft'}</p></div></div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3.5">Student</th><th className="px-5 py-3.5">Email</th><th className="px-5 py-3.5">Score</th><th className="px-5 py-3.5">Percentage</th><th className="px-5 py-3.5">Submitted</th></tr></thead><tbody className="divide-y divide-slate-100">{attempts.length === 0 ? <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">No student has submitted this quiz yet.</td></tr> : attempts.map((attempt) => { const profile = Array.isArray(attempt.profiles) ? attempt.profiles[0] : attempt.profiles; const pct = attempt.total_marks ? Math.round(attempt.score / attempt.total_marks * 100) : 0; return <tr key={attempt.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-semibold text-slate-800">{profile?.full_name ?? 'Student'}</td><td className="px-5 py-4 text-slate-500">{profile?.email ?? '—'}</td><td className="px-5 py-4 font-semibold">{attempt.score}/{attempt.total_marks}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pct >= 60 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{pct}%</span></td><td className="px-5 py-4 text-slate-500">{new Date(attempt.submitted_at).toLocaleString()}</td></tr> })}</tbody></table>
        </div>
      </div>
    </div>
  )
}
