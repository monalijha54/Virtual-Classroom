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
        <div className="card p-10 text-center"><Megaphone className="mx-auto text-slate-300" size={34} /><h3 className="mt-3 font-semibold text-slate-800">No announcements yet</h3><p className="mt-1 text-sm text-slate-500">Class updates will appear here.</p></div>
      ) : items.map((item) => (
        <div key={item.id} className="card p-5">
          <div className="flex gap-4">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Megaphone size={18} /></div>
            <div className="min-w-0 flex-1"><p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.message}</p><p className="mt-2 text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</p></div>
            {profile?.role === 'teacher' && <button onClick={() => remove(item.id)} className="h-fit rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Delete"><Trash2 size={16} /></button>}
          </div>
        </div>
      ))}
    </div>
  )
}
