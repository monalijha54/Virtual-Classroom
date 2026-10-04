import { ArrowRight, BookOpen, Code2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Classroom } from '../lib/types'

const CARD_TINTS = ['#fff4c4', '#fde0f0', '#c3faf5', '#f5f3ff', '#ffe6cd', '#ffc6c6'] as const

export function ClassroomCard({ classroom, index }: { classroom: Classroom; index: number }) {
  const tint = CARD_TINTS[index % CARD_TINTS.length]
  return (
    <Link
      to={`/class/${classroom.id}`}
      className="card group flex flex-col overflow-hidden p-0 transition hover:-translate-y-1"
      style={{ boxShadow: 'rgba(5, 0, 56, 0.06) 0px 4px 12px 0px' }}
    >
      <div className="board-dots flex items-start p-5" style={{ background: tint }}>
        <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-white" style={{ color: '#1c1c1e', border: '1px solid #eef0f3' }}>
          <BookOpen size={21} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 pt-4">
        <p className="text-[11px] font-semibold uppercase" style={{ letterSpacing: '0.05em', color: '#6b6f7e' }}>
          <span className="truncate">{classroom.subject}</span>
        </p>
        <h3 className="mt-1 truncate font-display text-[20px] font-medium leading-snug" style={{ color: '#1c1c1e' }}>
          {classroom.name}
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm font-normal" style={{ color: '#555a6a' }}>
          <Code2 size={15} />
          <span>Code: <span className="font-mono tracking-[0.08em]">{classroom.class_code}</span></span>
        </p>
        <div className="mt-4 flex h-11 items-center justify-between rounded-full px-5 text-sm font-medium" style={{ background: '#1c1c1e', color: '#ffffff' }}>
          <span>Open classroom</span>
          <ArrowRight size={17} className="transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}
