import type { ReactNode } from 'react'

export function StatCard({ index, label, value, icon }: { index: number; label: string; value: ReactNode; icon: ReactNode }) {
  const tints = ['#fff4c4', '#fde0f0', '#c3faf5', '#f5f3ff', '#ffe6cd', '#ffc6c6']
  const tint = tints[index % tints.length]
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: '#6b6f7e' }}>{label}</p>
          <p className="mt-2 font-display text-2xl font-medium" style={{ color: '#1c1c1e' }}>{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-[12px]" style={{ background: tint, color: '#1c1c1e' }}>{icon}</div>
      </div>
    </div>
  )
}

export function Badge({ children }: { tone?: number; children: ReactNode }) {
  return (
    <span className="pill pill-yellow">
      {children}
    </span>
  )
}

export function EmptyState({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <div className="card-warm p-10 text-center sm:p-12">
      {children}
      <h3 className="mt-4 font-display text-xl font-medium" style={{ color: '#1c1c1e' }}>{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6" style={{ color: '#555a6a' }}>{body}</p>
    </div>
  )
}
