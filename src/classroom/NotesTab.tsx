import { Download, FileText, Plus, Trash2, Upload } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Modal } from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Note } from '../lib/types'
import { DecorativeShape, accentFor } from '../components/DecorativeShape'

export function NotesTab({ classroomId }: { classroomId: string }) {
  const { profile } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [showUpload, setShowUpload] = useState(false)

  async function load() {
    const { data, error } = await supabase.from('notes').select('*').eq('classroom_id', classroomId).order('created_at', { ascending: false })
    if (error) toast.error(error.message)
    setNotes((data ?? []) as Note[])
  }
  useEffect(() => { load() }, [classroomId])

  async function openFile(note: Note) {
    const { data, error } = await supabase.storage.from('notes').createSignedUrl(note.file_path, 3600)
    if (error) return toast.error(error.message)
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  async function remove(note: Note) {
    if (!confirm(`Delete “${note.title}”?`)) return
    const { error: storageError } = await supabase.storage.from('notes').remove([note.file_path])
    if (storageError) return toast.error(storageError.message)
    const { error } = await supabase.from('notes').delete().eq('id', note.id)
    if (error) toast.error(error.message); else { toast.success('Note deleted'); load() }
  }

  return (
    <div>
      {profile?.role === 'teacher' && <div className="mb-4 flex justify-end"><button className="btn-accent" onClick={() => setShowUpload(true)}><Plus size={17} />Upload notes</button></div>}
      <div className="space-y-3">
        {notes.length === 0 && <div className="card-warm p-10 text-center"><div className="flex items-end justify-center gap-2"><DecorativeShape kind="capsule" color="#6478E0" size={20} rotate={-10} /><DecorativeShape kind="sunburst" color="#C7B79C" size={32} /></div><FileText className="mx-auto mt-4" size={30} style={{ color: '#A2907A' }} /><h3 className="mt-3 font-display font-bold" style={{ color: '#18130F' }}>No notes uploaded</h3><p className="mt-1 text-sm" style={{ color: '#6E6153' }}>PDFs and images shared by the teacher will appear here.</p></div>}
        {notes.map((note, i) => (
          <div key={note.id} className="frame-card flex flex-col gap-3 p-2.5 sm:flex-row sm:items-center" style={{ background: accentFor(i) }}>
            <div className="frame-thumb relative flex h-16 w-16 shrink-0 items-center justify-center" style={{ background: '#E7DCC4' }}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: '#18130F', color: '#FAF6ED' }}><FileText size={19} /></span>
            </div>
            <div className="min-w-0 flex-1 px-1"><h3 className="truncate font-display font-bold" style={{ color: '#18130F' }}>{note.title}</h3><p className="mt-0.5 truncate text-sm font-semibold" style={{ color: '#18130F' }}>{note.description || note.file_name}</p><p className="mt-1 text-xs font-semibold" style={{ color: '#18130F' }}>{new Date(note.created_at).toLocaleDateString()}</p></div>
            <div className="flex gap-2 px-1 pb-1"><button className="btn-secondary !bg-white" onClick={() => openFile(note)}><Download size={16} />View</button>{profile?.role === 'teacher' && <button className="btn-danger !bg-[#18130F] !text-[#FAF6ED]" onClick={() => remove(note)}><Trash2 size={16} /></button>}</div>
          </div>
        ))}
      </div>
      {showUpload && profile && <UploadNoteModal classroomId={classroomId} teacherId={profile.id} onClose={() => setShowUpload(false)} onUploaded={load} />}
    </div>
  )
}

function UploadNoteModal({ classroomId, teacherId, onClose, onUploaded }: { classroomId: string; teacherId: string; onClose: () => void; onUploaded: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!file) return toast.error('Choose a PDF, JPG or PNG file.')
    if (file.size > 10 * 1024 * 1024) return toast.error('File must be 10 MB or smaller.')
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) return toast.error('Only PDF, JPG and PNG are allowed.')

    setBusy(true)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${classroomId}/${crypto.randomUUID()}-${safeName}`
    const { error: uploadError } = await supabase.storage.from('notes').upload(path, file, { contentType: file.type, upsert: false })
    if (uploadError) { setBusy(false); return toast.error(uploadError.message) }

    const { error } = await supabase.from('notes').insert({ classroom_id: classroomId, teacher_id: teacherId, title: title.trim(), description: description.trim(), file_path: path, file_name: file.name, mime_type: file.type })
    if (error) {
      await supabase.storage.from('notes').remove([path])
      setBusy(false)
      return toast.error(error.message)
    }
    setBusy(false); toast.success('Notes uploaded'); onUploaded(); onClose()
  }

  return <Modal title="Upload notes" onClose={onClose}><form className="space-y-4" onSubmit={submit}><div><label className="label">Title</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Unit 1 — Introduction" required /></div><div><label className="label">Description</label><textarea className="input min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional short description" /></div><div><label className="label">File</label><label className="flex cursor-pointer items-center justify-center gap-2 rounded-[12px] border-2 border-dashed p-6 text-sm transition hover:bg-black/[0.02]" style={{ borderColor: '#E4DBCB', color: '#6E6153' }}><Upload size={18} />{file ? file.name : 'Choose PDF, JPG or PNG'}<input type="file" accept=".pdf,image/jpeg,image/png" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label><p className="mt-1.5 text-xs" style={{ color: '#A79C8C' }}>Maximum 10 MB.</p></div><div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-accent" disabled={busy || !file}>{busy ? 'Uploading…' : 'Upload'}</button></div></form></Modal>
}
