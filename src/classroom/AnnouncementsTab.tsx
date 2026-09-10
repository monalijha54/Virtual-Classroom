import { Megaphone, Send, Trash2 } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Announcement } from '../lib/types'
import { DecorativeShape, accentFor } from '../components/DecorativeShape'

export function AnnouncementsTab({ classroomId }: { classroomId: string }) {
  const { profile } = useAuth()
  const [items, setItems] = useState<Announcement[]>([])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const { data, error } = await supabase.from('announcements').select('*').eq('classroom_id', classroomId).order('created_at', { ascending: false })
    if (error) toast.error(error.message)
    setItems((data ?? []) as Announcement[])
  }
  useEffect(() => { load() }, [classroomId])

  async function post(e: FormEvent) {
    e.preventDefault()
    if (!profile || !message.trim()) return
    setBusy(true)
    const { error } = await supabase.from('announcements').insert({ classroom_id: classroomId, teacher_id: profile.id, message: message.trim() })
    setBusy(false)
    if (error) return toast.error(error.message)
    setMessage(''); toast.success('Announcement posted'); load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this announcement?')) return
    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (error) toast.error(error.message); else load()
  }

  return (
    <div className="space-y-5">
      {profile?.role === 'teacher' && (
        <form onSubmit={post} className="card p-5">
          <label className="label">Post an announcement</label>
          <textarea className="input min-h-24 resize-y" maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share an update with your class…" required />
          <div className="mt-3 flex justify-end"><button className="btn-primary" disabled={busy || !message.trim()}><Send size={16} />{busy ? 'Posting…' : 'Post'}</button></div>
        </form>
      )}

      {items.length === 0 ? (
        <div className="card-warm p-10 text-center">
          <div className="flex items-end justify-center gap-2"><DecorativeShape kind="sunburst" color="#F2C230" size={34} /><DecorativeShape kind="circle" color="#CBDA2E" size={22} /></div>
          <Megaphone className="mx-auto mt-4" size={30} style={{ color: '#A2907A' }} />
          <h3 className="mt-3 font-display font-bold" style={{ color: '#18130F' }}>No announcements yet</h3>
          <p className="mt-1 text-sm" style={{ color: '#6E6153' }}>Class updates will appear here.</p>
        </div>
      ) : items.map((item, i) => (
        <div key={item.id} className="frame-card p-2.5" style={{ background: accentFor(i) }}>
          <div className="flex gap-3">
            <div className="frame-thumb flex h-12 w-12 shrink-0 items-center justify-center" style={{ background: '#E7DCC4' }}><span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: '#18130F', color: '#FAF6ED' }}><Megaphone size={17} /></span></div>
            <div className="min-w-0 flex-1 px-1 py-1"><p className="whitespace-pre-wrap text-sm font-semibold leading-6" style={{ color: '#18130F' }}>{item.message}</p><p className="mt-1 text-xs font-bold" style={{ color: '#18130F' }}>{new Date(item.created_at).toLocaleString()}</p></div>
            {profile?.role === 'teacher' && <button onClick={() => remove(item.id)} className="h-fit rounded-full bg-white p-2 transition hover:brightness-95" style={{ color: '#18130F' }} aria-label="Delete"><Trash2 size={16} /></button>}
          </div>
        </div>
      ))}
    </div>
  )
}
