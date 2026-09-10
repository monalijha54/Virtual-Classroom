import type { ReactNode } from 'react'
import { accentFor } from './DecorativeShape'

export function StatCard({ index, label, value, icon }: { index: number; label: string; value: ReactNode; icon: ReactNode }) {
  const fills = ['#C7B79C', '#FFFFFF', '#F2C230', '#CBDA2E'] as const
  const bg = fills[index % fills.length]
  const dark = bg !== '#FFFFFF'
  return (
    <div className="rounded-[20px] border p-5" style={{ background: bg, borderColor: '#E4DBCB' }}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.08em]" style={{ color: dark ? '#18130F' : '#6E6153' }}>{label}</p>
          <p className="mt-2 font-display text-3xl font-extrabold" style={{ color: '#18130F' }}>{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: '#18130F', color: '#FAF6ED' }}>{icon}</div>
      </div>
    </div>
  )
}

export function Badge({ tone = 0, children }: { tone?: number; children: ReactNode }) {
  return (
    <span className="pill" style={{ background: accentFor(tone), color: '#18130F' }}>
      {children}
    </span>
  )
}

export function EmptyState({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <div className="card-warm p-10 text-center sm:p-12">
      {children}
      <h3 className="mt-4 font-display text-xl font-bold" style={{ color: '#18130F' }}>{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6" style={{ color: '#6E6153' }}>{body}</p>
    </div>
  )
}
