import { ArrowRight, BookOpen, Code2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Classroom } from '../lib/types'

export function ClassroomCard({ classroom }: { classroom: Classroom; index: number }) {
  return (
    <Link
      to={`/class/${classroom.id}`}
      className="card group flex flex-col p-5 transition hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-[12px]" style={{ background: '#EDE1C7', color: '#18130F' }}>
          <BookOpen size={21} />
        </span>
        <span className="rounded-full px-2.5 py-1 font-mono text-xs font-bold" style={{ background: '#EDE1C7', color: '#18130F' }}>
          {classroom.class_code}
        </span>
      </div>
      <p className="mt-4 text-[12px] font-bold uppercase" style={{ letterSpacing: '0.08em', color: '#6E6153' }}>
        <span className="truncate">{classroom.subject}</span>
      </p>
      <h3 className="mt-1 truncate font-display text-[20px] font-bold leading-snug" style={{ color: '#18130F' }}>
        {classroom.name}
      </h3>
      <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium" style={{ color: '#6E6153' }}>
        <Code2 size={15} />
        <span>Code: <span className="font-mono tracking-[0.08em]">{classroom.class_code}</span></span>
      </p>
      <div className="mt-4 flex h-11 items-center justify-between rounded-full px-5 text-sm font-bold" style={{ background: '#18130F', color: '#FAF6ED' }}>
        <span>Open classroom</span>
        <ArrowRight size={17} className="transition group-hover:translate-x-1" />
      </div>
    </Link>
  )
}
