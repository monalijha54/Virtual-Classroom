import { ArrowRight, BookOpen, Code2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Classroom } from '../lib/types'
import { DecorativeShape, accentFor } from './DecorativeShape'

function Sticker({ index }: { index: number }) {
  if (index % 3 === 0) return <DecorativeShape kind="sunburst" color="#F23DAE" size={20} rotate={-8} />
  if (index % 3 === 1) return <DecorativeShape kind="squiggle" color="#18130F" size={22} />
  return <DecorativeShape kind="capsule" color="#CBDA2E" size={18} rotate={-12} />
}

export function ClassroomCard({ classroom, index }: { classroom: Classroom; index: number }) {
  return (
    <Link
      to={`/class/${classroom.id}`}
      className="frame-card group flex flex-col transition hover:-translate-y-1"
      style={{ background: accentFor(index) }}
    >
      <div className="frame-visual flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between">
          <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: '#18130F', color: '#FAF6ED' }}>
            <BookOpen size={24} />
          </span>
          <span aria-hidden><Sticker index={index} /></span>
        </div>
        <p className="mt-6 flex items-center gap-2 text-[12px] font-bold uppercase" style={{ letterSpacing: '0.22em', color: '#18130F' }}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: '#18130F' }} />
          <span className="truncate">{classroom.subject}</span>
        </p>
        <h3 className="mt-1.5 truncate font-display text-[28px] font-extrabold leading-tight" style={{ color: '#18130F' }}>
          {classroom.name}
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-[15px] font-semibold" style={{ color: '#A79C8C' }}>
          <Code2 size={16} />
          <span>Code: <span className="font-mono tracking-widest">{classroom.class_code}</span></span>
        </p>
      </div>
      <div className="frame-cta mt-3 flex h-12 items-center justify-between px-5 text-[16px] font-semibold">
        <span>Open classroom</span>
        <ArrowRight size={20} className="transition group-hover:translate-x-1" />
      </div>
    </Link>
  )
}
