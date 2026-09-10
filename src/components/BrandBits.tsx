import type { ReactNode } from 'react'

export function StatCard({ label, value, icon }: { index: number; label: string; value: ReactNode; icon: ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.08em]" style={{ color: '#6E6153' }}>{label}</p>
          <p className="mt-2 font-display text-2xl font-bold" style={{ color: '#18130F' }}>{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-[12px]" style={{ background: '#EDE1C7', color: '#18130F' }}>{icon}</div>
      </div>
    </div>
  )
}

export function Badge({ children }: { tone?: number; children: ReactNode }) {
  return (
    <span className="pill" style={{ background: '#EDE1C7', color: '#18130F' }}>
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
