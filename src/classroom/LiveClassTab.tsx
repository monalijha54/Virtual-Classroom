import { Radio, Square, Video } from 'lucide-react'
import { FormEvent, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Modal } from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { LiveSession } from '../lib/types'

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => { dispose: () => void }
  }
}

function JitsiEmbed({ roomName, displayName, email, student }: { roomName: string; displayName: string; email: string; student: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let api: { dispose: () => void } | null = null
    let cancelled = false

    async function mountMeeting() {
      if (!window.JitsiMeetExternalAPI) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector<HTMLScriptElement>('script[data-jitsi-api="true"]')
          if (existing) {
            if (window.JitsiMeetExternalAPI) resolve()
            else { existing.addEventListener('load', () => resolve(), { once: true }); existing.addEventListener('error', () => reject(new Error('Could not load Jitsi')), { once: true }) }
            return
          }
          const script = document.createElement('script')
          script.src = 'https://meet.jit.si/external_api.js'
          script.async = true
          script.dataset.jitsiApi = 'true'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Could not load Jitsi'))
          document.body.appendChild(script)
        })
      }
      if (cancelled || !containerRef.current || !window.JitsiMeetExternalAPI) return
      api = new window.JitsiMeetExternalAPI('meet.jit.si', {
        roomName,
        parentNode: containerRef.current,
        width: '100%',
        height: 650,
        userInfo: { displayName, email },
        configOverwrite: { startWithAudioMuted: student, prejoinConfig: { enabled: true } },
        interfaceConfigOverwrite: { MOBILE_APP_PROMO: false },
      })
    }

    mountMeeting().catch((error) => toast.error(error instanceof Error ? error.message : 'Could not start video meeting'))
    return () => { cancelled = true; api?.dispose() }
  }, [roomName, displayName, email, student])

  return <div ref={containerRef} className="min-h-[650px] w-full" style={{ background: '#1c1c1e' }} />
}

export function LiveClassTab({ classroomId, classroomName }: { classroomId: string; classroomName: string }) {
  const { profile } = useAuth()
  const [session, setSession] = useState<LiveSession | null>(null)
  const [showStart, setShowStart] = useState(false)

  async function load() {
    const { data, error } = await supabase.from('live_sessions').select('*').eq('classroom_id', classroomId).eq('active', true).order('started_at', { ascending: false }).limit(1).maybeSingle()
    if (error) toast.error(error.message)
    setSession((data as LiveSession | null) ?? null)
  }
  useEffect(() => { load() }, [classroomId])

  async function stop() {
    if (!session || !confirm('End this live class for everyone?')) return
    const { error } = await supabase.from('live_sessions').update({ active: false, ended_at: new Date().toISOString() }).eq('id', session.id)
    if (error) return toast.error(error.message)
    toast.success('Live class ended'); setSession(null)
  }

  if (!profile) return null

  return (
    <div>
      {!session ? (
        <div className="card p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[12px]" style={{ background: '#fff4c4', color: '#1c1c1e' }}><Video size={24} /></div>
          <h3 className="mt-4 font-display text-lg font-medium" style={{ color: '#1c1c1e' }}>No live class right now</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6" style={{ color: '#555a6a' }}>{profile.role === 'teacher' ? 'Start a live session and students in this classroom can join immediately.' : 'When your teacher starts a session, it will appear here.'}</p>
          {profile.role === 'teacher' && <button className="btn-primary mt-5" onClick={() => setShowStart(true)}><Radio size={17} />Start live class</button>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
            <div><div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#600000' }}><span className="h-2 w-2 animate-pulse rounded-full" style={{ background: '#600000' }} /> LIVE NOW</div><h3 className="mt-1 font-display font-medium" style={{ color: '#1c1c1e' }}>{session.title}</h3><p className="text-xs" style={{ color: '#a5a8b5' }}>Started {new Date(session.started_at).toLocaleTimeString()}</p></div>
            {profile.role === 'teacher' && <button className="btn-danger" onClick={stop}><Square size={15} />End class</button>}
          </div>
          <div className="whiteboard-mockup overflow-hidden" style={{ borderRadius: 16, background: '#1c1c1e' }}>
            <JitsiEmbed roomName={session.room_name} displayName={profile.full_name} email={profile.email} student={profile.role === 'student'} />
          </div>
        </div>
      )}
      {showStart && <StartLiveModal classroomId={classroomId} classroomName={classroomName} teacherId={profile.id} onClose={() => setShowStart(false)} onStarted={load} />}
    </div>
  )
}

function StartLiveModal({ classroomId, classroomName, teacherId, onClose, onStarted }: { classroomId: string; classroomName: string; teacherId: string; onClose: () => void; onStarted: () => void }) {
  const [title, setTitle] = useState(`${classroomName} — Live Class`)
  const [busy, setBusy] = useState(false)
  async function start(e: FormEvent) {
    e.preventDefault(); setBusy(true)
    await supabase.from('live_sessions').update({ active: false, ended_at: new Date().toISOString() }).eq('classroom_id', classroomId).eq('active', true)
    const room = `rurallearn-${classroomId.replaceAll('-', '')}-${crypto.randomUUID().replaceAll('-', '')}`
    const { error } = await supabase.from('live_sessions').insert({ classroom_id: classroomId, teacher_id: teacherId, title: title.trim(), room_name: room, active: true })
    setBusy(false)
    if (error) return toast.error(error.message)
    toast.success('Live class started'); onStarted(); onClose()
  }
  return <Modal title="Start live class" onClose={onClose}><form onSubmit={start}><label className="label">Session title</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required /><p className="mt-3 rounded-[12px] p-3 text-sm leading-6" style={{ background: '#fff8e0', color: '#555a6a', border: '1px solid #eef0f3' }}>The video meeting will run inside the classroom page using Jitsi Meet.</p><div className="mt-5 flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" disabled={busy}>{busy ? 'Starting…' : 'Start now'}</button></div></form></Modal>
}
