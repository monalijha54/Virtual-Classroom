import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(5,0,56,0.4)' }} onMouseDown={onClose}>
      <div className={`max-h-[90vh] w-full overflow-y-auto bg-white ${wide ? 'max-w-3xl' : 'max-w-lg'}`} style={{ borderRadius: 28, border: '1px solid #eef0f3', boxShadow: 'rgba(5, 0, 56, 0.12) 0px 16px 48px -8px' }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between bg-white px-6 py-4" style={{ borderBottom: '1px solid #eef0f3' }}>
          <h2 className="font-display text-lg font-medium" style={{ color: '#1c1c1e' }}>{title}</h2>
          <button onClick={onClose} className="rounded-full p-2 transition hover:bg-black/5" style={{ color: '#6b6f7e', border: '1px solid #eef0f3' }} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
