import { ArrowLeft, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Question, Quiz, QuizOption } from '../lib/types'

type ReviewRow = Question & {
  question_id: string
  selected_option: QuizOption | null
  correct_option: QuizOption
  is_correct: boolean
  marks_awarded: number
}

export function TakeQuizPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, QuizOption>>({})
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ attemptId: string; score: number; total: number } | null>(null)
  const [review, setReview] = useState<ReviewRow[]>([])

  useEffect(() => {
    async function load() {
      if (!quizId) return
      const { data: quizData, error: quizError } = await supabase.from('quizzes').select('*').eq('id', quizId).single()
      if (quizError || !quizData) { toast.error('Quiz not found.'); navigate(-1); return }
      setQuiz(quizData as Quiz)

      const { data: existing } = await supabase.from('quiz_attempts').select('*').eq('quiz_id', quizId).maybeSingle()
      if (existing) {
        setResult({ attemptId: existing.id, score: existing.score, total: existing.total_marks })
        await loadReview(existing.id)
        setLoading(false)
        return
      }

      const { data: questionData, error } = await supabase.rpc('get_quiz_questions', { p_quiz_id: quizId })
      if (error) { toast.error(error.message); return }
      setQuestions((questionData ?? []) as Question[])

      const timerKey = `rurallearn-quiz-start-${quizId}`
      const stored = Number(localStorage.getItem(timerKey) || 0)
      const now = Date.now()
      const startedAt = stored || now
      if (!stored) localStorage.setItem(timerKey, String(startedAt))
      const end = startedAt + quizData.duration_minutes * 60_000
      setSecondsLeft(Math.max(0, Math.floor((end - now) / 1000)))
      setLoading(false)
    }
    load()
  }, [quizId])

  useEffect(() => {
    if (loading || result || !quiz) return
    if (secondsLeft <= 0) {
      if (questions.length) submitQuiz(true)
      return
    }
    const timer = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [loading, result, quiz, secondsLeft <= 0, questions.length])

  async function loadReview(attemptId: string) {
    const { data, error } = await supabase.rpc('get_attempt_review', { p_attempt_id: attemptId })
    if (error) return toast.error(error.message)
    setReview((data ?? []) as ReviewRow[])
  }

  async function submitQuiz(auto = false) {
    if (!quizId || submitting || result) return
    if (!auto && !confirm(`Submit quiz now? You answered ${Object.keys(answers).length} of ${questions.length} questions.`)) return
    setSubmitting(true)
    const { data, error } = await supabase.rpc('submit_quiz', { p_quiz_id: quizId, p_answers: answers })
    setSubmitting(false)
    if (error) return toast.error(error.message)
    const row = Array.isArray(data) ? data[0] : data
    if (!row) return toast.error('Could not read quiz result.')
    localStorage.removeItem(`rurallearn-quiz-start-${quizId}`)
    const nextResult = { attemptId: row.attempt_id, score: row.score, total: row.total_marks }
    setResult(nextResult)
    await loadReview(row.attempt_id)
    toast.success(auto ? 'Time is up. Quiz submitted.' : 'Quiz submitted!')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const time = useMemo(() => `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`, [secondsLeft])

  if (loading) return <div className="py-20 text-center text-slate-500">Loading quiz…</div>
  if (!quiz) return null

  if (result) {
    const percentage = result.total ? Math.round((result.score / result.total) * 100) : 0
    return (
      <div className="mx-auto max-w-4xl">
        <Link to={`/class/${quiz.classroom_id}`} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600"><ArrowLeft size={16} />Back to classroom</Link>
        <div className="card p-7 text-center sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={31} /></div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-indigo-600">Quiz complete</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{quiz.title}</h1>
          <p className="mt-5 text-5xl font-bold text-slate-900">{result.score}<span className="text-2xl text-slate-400">/{result.total}</span></p>
          <p className="mt-2 text-lg font-semibold text-indigo-600">{percentage}%</p>
        </div>
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Answer review</h2>
          {review.map((row, index) => {
            const options: Record<QuizOption, string> = { A: row.option_a, B: row.option_b, C: row.option_c, D: row.option_d }
            return <div key={row.question_id} className="card p-5"><div className="flex items-start gap-3"><div className={`mt-0.5 ${row.is_correct ? 'text-emerald-600' : 'text-rose-600'}`}>{row.is_correct ? <CheckCircle2 size={21} /> : <XCircle size={21} />}</div><div className="flex-1"><p className="font-semibold text-slate-900">{index + 1}. {row.question_text}</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{(['A','B','C','D'] as QuizOption[]).map((option) => <div key={option} className={`rounded-xl border px-3 py-2 text-sm ${option === row.correct_option ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : option === row.selected_option && !row.is_correct ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-slate-200 text-slate-600'}`}><span className="mr-2 font-bold">{option}.</span>{options[option]}{option === row.correct_option && <span className="ml-2 text-xs font-semibold">Correct</span>}{option === row.selected_option && <span className="ml-2 text-xs">Your answer</span>}</div>)}</div><p className="mt-3 text-xs text-slate-400">Marks: {row.marks_awarded}/{row.marks}</p></div></div></div>
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link to={`/class/${quiz.classroom_id}`} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600"><ArrowLeft size={16} />Back to classroom</Link>
      <div className="card sticky top-20 z-20 mb-5 flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
        <div><h1 className="font-bold text-slate-900">{quiz.title}</h1><p className="text-sm text-slate-500">{questions.length} questions • {quiz.duration_minutes} minutes</p></div>
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2 font-mono text-sm font-bold ${secondsLeft < 60 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'}`}><Clock size={16} />{time}</div>
      </div>
      <div className="space-y-4">
        {questions.map((question, index) => {
          const options: [QuizOption, string][] = [['A', question.option_a], ['B', question.option_b], ['C', question.option_c], ['D', question.option_d]]
          return <div key={question.id} className="card p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><p className="font-semibold leading-6 text-slate-900">{index + 1}. {question.question_text}</p><span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">{question.marks} mark{question.marks > 1 ? 's' : ''}</span></div><div className="mt-4 space-y-2">{options.map(([key, text]) => <label key={key} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm transition ${answers[question.id] === key ? 'border-indigo-400 bg-indigo-50 text-indigo-900' : 'border-slate-200 hover:bg-slate-50'}`}><input type="radio" name={question.id} checked={answers[question.id] === key} onChange={() => setAnswers((old) => ({ ...old, [question.id]: key }))} /><span className="font-bold text-slate-500">{key}</span><span>{text}</span></label>)}</div></div>
        })}
      </div>
      <div className="mt-6 flex justify-end"><button className="btn-primary min-w-36" disabled={submitting || questions.length === 0} onClick={() => submitQuiz(false)}>{submitting ? 'Submitting…' : 'Submit quiz'}</button></div>
    </div>
  )
}
