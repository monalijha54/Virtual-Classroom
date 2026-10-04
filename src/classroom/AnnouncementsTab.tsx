import { Megaphone, Send, Trash2 } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Announcement } from '../lib/types'

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
        <div className="card p-10 text-center">
          <Megaphone className="mx-auto" size={28} style={{ color: '#8e91a0' }} />
          <h3 className="mt-3 font-display font-medium" style={{ color: '#1c1c1e' }}>No announcements yet</h3>
          <p className="mt-1 text-sm" style={{ color: '#555a6a' }}>Class updates will appear here.</p>
        </div>
      ) : items.map((item) => (
        <div key={item.id} className="card p-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]" style={{ background: '#fff4c4', color: '#1c1c1e' }}><Megaphone size={18} /></div>
            <div className="min-w-0 flex-1"><p className="whitespace-pre-wrap text-sm leading-6" style={{ color: '#2c2c34' }}>{item.message}</p><p className="mt-2 text-xs" style={{ color: '#a5a8b5' }}>{new Date(item.created_at).toLocaleString()}</p></div>
            {profile?.role === 'teacher' && <button onClick={() => remove(item.id)} className="h-fit rounded-full p-2 transition hover:bg-black/5" style={{ color: '#a5a8b5' }} aria-label="Delete"><Trash2 size={16} /></button>}
          </div>
        </div>
      ))}
    </div>
  )
}
