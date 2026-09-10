import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(24,19,15,0.5)' }} onMouseDown={onClose}>
      <div className={`max-h-[90vh] w-full overflow-y-auto bg-white ${wide ? 'max-w-3xl' : 'max-w-lg'}`} style={{ borderRadius: 32, boxShadow: '0 24px 64px rgba(24,19,15,0.28)' }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between bg-white px-6 py-4" style={{ borderBottom: '1px solid #E4DBCB' }}>
          <h2 className="font-display text-lg font-extrabold" style={{ color: '#18130F' }}>{title}</h2>
          <button onClick={onClose} className="rounded-full p-2 transition hover:bg-black/5" style={{ color: '#6E6153' }} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
