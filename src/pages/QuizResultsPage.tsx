import { ArrowLeft, BarChart3, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Quiz } from '../lib/types'
import { StatCard } from '../components/BrandBits'

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

  if (loading) return <div className="py-20 text-center" style={{ color: '#555a6a' }}>Loading results…</div>
  if (!quiz) return null

  return (
    <div>
      <Link to={`/class/${quiz.classroom_id}`} className="mb-5 inline-flex items-center gap-2 text-sm font-medium" style={{ color: '#555a6a' }}><ArrowLeft size={16} />Back to classroom</Link>
      <div className="mb-7"><p className="eyebrow">Quiz results</p><h1 className="mt-1 font-display text-3xl font-medium" style={{ color: '#1c1c1e' }}>{quiz.title}</h1><p className="mt-2" style={{ color: '#555a6a' }}>See every student's submitted result.</p></div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard index={1} label="Submissions" value={attempts.length} icon={<Users size={21} />} />
        <StatCard index={2} label="Class average" value={`${average}%`} icon={<BarChart3 size={21} />} />
        <StatCard index={0} label="Status" value={quiz.published ? 'Published' : 'Draft'} icon={<BarChart3 size={21} />} />
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm"><thead style={{ background: '#f7f8fa' }}><tr className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: '#6b6f7e' }}><th className="px-5 py-3.5">Student</th><th className="px-5 py-3.5">Email</th><th className="px-5 py-3.5">Score</th><th className="px-5 py-3.5">Percentage</th><th className="px-5 py-3.5">Submitted</th></tr></thead><tbody className="divide-y divide-[#eef0f3]">{attempts.length === 0 ? <tr><td colSpan={5} className="px-5 py-12 text-center" style={{ color: '#555a6a' }}>No student has submitted this quiz yet.</td></tr> : attempts.map((attempt) => { const profile = Array.isArray(attempt.profiles) ? attempt.profiles[0] : attempt.profiles; const pct = attempt.total_marks ? Math.round(attempt.score / attempt.total_marks * 100) : 0; return <tr key={attempt.id} className="transition hover:bg-black/[0.02]"><td className="px-5 py-4 font-medium" style={{ color: '#1c1c1e' }}>{profile?.full_name ?? 'Student'}</td><td className="px-5 py-4" style={{ color: '#555a6a' }}>{profile?.email ?? '—'}</td><td className="px-5 py-4 font-medium" style={{ color: '#1c1c1e' }}>{attempt.score}/{attempt.total_marks}</td><td className="px-5 py-4"><span className="pill pill-yellow">{pct}%</span></td><td className="px-5 py-4" style={{ color: '#555a6a' }}>{new Date(attempt.submitted_at).toLocaleString()}</td></tr> })}</tbody></table>
        </div>
      </div>
    </div>
  )
}
