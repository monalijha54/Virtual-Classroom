import { BarChart3, CheckCircle2, ClipboardList, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Modal } from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Quiz, QuizAttempt, QuizOption } from '../lib/types'
import { DecorativeShape } from '../components/DecorativeShape'

type DraftQuestion = {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: QuizOption
  marks: number
}

const emptyQuestion = (): DraftQuestion => ({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', marks: 1 })

export function QuizzesTab({ classroomId }: { classroomId: string }) {
  const { profile } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [showCreate, setShowCreate] = useState(false)

  async function load() {
    if (!profile) return
    const { data, error } = await supabase.from('quizzes').select('*').eq('classroom_id', classroomId).order('created_at', { ascending: false })
    if (error) toast.error(error.message)
    const rows = (data ?? []) as Quiz[]
    setQuizzes(rows)
    if (profile.role === 'student' && rows.length) {
      const { data: attemptData } = await supabase.from('quiz_attempts').select('*').in('quiz_id', rows.map((q) => q.id)).eq('student_id', profile.id)
      setAttempts((attemptData ?? []) as QuizAttempt[])
    }
  }
  useEffect(() => { load() }, [classroomId, profile])

  async function togglePublish(quiz: Quiz) {
    const { error } = await supabase.from('quizzes').update({ published: !quiz.published }).eq('id', quiz.id)
    if (error) return toast.error(error.message)
    toast.success(quiz.published ? 'Quiz unpublished' : 'Quiz published'); load()
  }

  async function remove(quiz: Quiz) {
    if (!confirm(`Delete “${quiz.title}” and its questions/results?`)) return
    const { error } = await supabase.from('quizzes').delete().eq('id', quiz.id)
    if (error) toast.error(error.message); else { toast.success('Quiz deleted'); load() }
  }

  if (!profile) return null

  return (
    <div>
      {profile.role === 'teacher' && <div className="mb-4 flex justify-end"><button className="btn-accent" onClick={() => setShowCreate(true)}><Plus size={17} />Create quiz</button></div>}
      <div className="space-y-3">
        {quizzes.length === 0 && <div className="card-warm p-10 text-center"><div className="flex items-end justify-center gap-2"><DecorativeShape kind="triangle" color="#3B332C" size={28} /><DecorativeShape kind="sunburst" color="#F2C230" size={32} /></div><ClipboardList className="mx-auto mt-4" size={30} style={{ color: '#A2907A' }} /><h3 className="mt-3 font-display font-bold" style={{ color: '#18130F' }}>No quizzes yet</h3><p className="mt-1 text-sm" style={{ color: '#6E6153' }}>{profile.role === 'teacher' ? 'Create an MCQ quiz for your students.' : 'Published quizzes will appear here.'}</p></div>}
        {quizzes.map((quiz) => {
          const attempt = attempts.find((a) => a.quiz_id === quiz.id)
          const percentage = attempt && attempt.total_marks ? Math.round((attempt.score / attempt.total_marks) * 100) : 0
          return (
            <div key={quiz.id} className="card p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-bold" style={{ color: '#18130F' }}>{quiz.title}</h3>
                    {profile.role === 'teacher' && <span className="pill" style={quiz.published ? { background: '#CBDA2E', color: '#18130F' } : { background: '#EDE1C7', color: '#6E6153' }}>{quiz.published ? 'Published' : 'Draft'}</span>}
                    {attempt && <span className="pill" style={{ background: '#F2C230', color: '#18130F' }}>Completed</span>}
                  </div>
                  <p className="mt-1 text-sm" style={{ color: '#6E6153' }}>{quiz.description || 'MCQ quiz'} • {quiz.duration_minutes} min</p>
                  {attempt && <p className="mt-2 text-sm font-bold" style={{ color: '#18130F' }}>Your result: {attempt.score}/{attempt.total_marks} ({percentage}%)</p>}
                </div>
                {profile.role === 'teacher' ? (
                  <div className="flex flex-wrap gap-2">
                    <Link className="btn-secondary" to={`/quiz/${quiz.id}/results`}><BarChart3 size={16} />Results</Link>
                    <button className="btn-secondary" onClick={() => togglePublish(quiz)}>{quiz.published ? <EyeOff size={16} /> : <Eye size={16} />}{quiz.published ? 'Unpublish' : 'Publish'}</button>
                    <button className="btn-danger" onClick={() => remove(quiz)}><Trash2 size={16} /></button>
                  </div>
                ) : attempt ? (
                  <div className="flex items-center gap-2 font-bold" style={{ color: '#3f6212' }}><CheckCircle2 size={18} />Submitted</div>
                ) : (
                  <Link className="btn-primary" to={`/quiz/${quiz.id}`}>Start quiz</Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {showCreate && <CreateQuizModal classroomId={classroomId} teacherId={profile.id} onClose={() => setShowCreate(false)} onCreated={load} />}
    </div>
  )
}

function CreateQuizModal({ classroomId, teacherId, onClose, onCreated }: { classroomId: string; teacherId: string; onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(15)
  const [publishNow, setPublishNow] = useState(true)
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion()])
  const [busy, setBusy] = useState(false)

  function updateQuestion(index: number, field: keyof DraftQuestion, value: string | number) {
    setQuestions((old) => old.map((q, i) => i === index ? { ...q, [field]: value } : q))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (questions.length === 0) return toast.error('Add at least one question.')
    if (questions.some((q) => !q.question_text.trim() || !q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim())) return toast.error('Complete every question and option.')
    setBusy(true)
    const { data: quiz, error } = await supabase.from('quizzes').insert({ classroom_id: classroomId, teacher_id: teacherId, title: title.trim(), description: description.trim(), duration_minutes: duration, published: false }).select().single()
    if (error || !quiz) { setBusy(false); return toast.error(error?.message ?? 'Could not create quiz') }

    const { error: questionError } = await supabase.from('questions').insert(questions.map((q, index) => ({ quiz_id: quiz.id, ...q, question_text: q.question_text.trim(), option_a: q.option_a.trim(), option_b: q.option_b.trim(), option_c: q.option_c.trim(), option_d: q.option_d.trim(), position: index + 1 })))
    if (questionError) {
      await supabase.from('quizzes').delete().eq('id', quiz.id)
      setBusy(false); return toast.error(questionError.message)
    }
    if (publishNow) {
      const { error: publishError } = await supabase.from('quizzes').update({ published: true }).eq('id', quiz.id)
      if (publishError) { setBusy(false); return toast.error(publishError.message) }
    }
    setBusy(false); toast.success('Quiz created'); onCreated(); onClose()
  }

  return (
    <Modal title="Create MCQ quiz" onClose={onClose} wide>
      <form className="space-y-5" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2"><div><label className="label">Quiz title</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Operating Systems Quiz 1" required /></div><div><label className="label">Duration (minutes)</label><input className="input" type="number" min={1} max={180} value={duration} onChange={(e) => setDuration(Number(e.target.value))} required /></div></div>
        <div><label className="label">Description</label><textarea className="input min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional instructions" /></div>
        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={index} className="rounded-[20px] border p-4" style={{ background: '#EDE1C7', borderColor: '#E4DBCB' }}>
              <div className="mb-3 flex items-center justify-between"><h3 className="font-display font-bold" style={{ color: '#18130F' }}>Question {index + 1}</h3>{questions.length > 1 && <button type="button" className="rounded-full p-2 transition hover:bg-black/5" style={{ color: '#A79C8C' }} onClick={() => setQuestions((old) => old.filter((_, i) => i !== index))}><Trash2 size={16} /></button>}</div>
              <textarea className="input min-h-20 bg-white" value={q.question_text} onChange={(e) => updateQuestion(index, 'question_text', e.target.value)} placeholder="Enter the question" required />
              <div className="mt-3 grid gap-2 sm:grid-cols-2">{(['a','b','c','d'] as const).map((letter) => <div key={letter} className="flex items-center gap-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold" style={{ color: '#6E6153', border: '1px solid #E4DBCB' }}>{letter.toUpperCase()}</span><input className="input bg-white" value={q[`option_${letter}`]} onChange={(e) => updateQuestion(index, `option_${letter}`, e.target.value)} placeholder={`Option ${letter.toUpperCase()}`} required /></div>)}</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2"><div><label className="label">Correct answer</label><select className="input bg-white" value={q.correct_option} onChange={(e) => updateQuestion(index, 'correct_option', e.target.value)}><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select></div><div><label className="label">Marks</label><input className="input bg-white" type="number" min={1} max={100} value={q.marks} onChange={(e) => updateQuestion(index, 'marks', Number(e.target.value))} /></div></div>
            </div>
          ))}
        </div>
        <button type="button" className="btn-secondary" onClick={() => setQuestions((old) => [...old, emptyQuestion()])}><Plus size={16} />Add question</button>
        <label className="flex items-center gap-3 rounded-[12px] border p-3 text-sm" style={{ borderColor: '#E4DBCB', color: '#2B241E' }}><input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} className="h-4 w-4 accent-[#18130F]" />Publish immediately so students can attempt it</label>
        <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: '#E4DBCB' }}><button type="button" className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Create quiz'}</button></div>
      </form>
    </Modal>
  )
}
