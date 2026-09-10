type ShapeKind = 'sunburst' | 'circle' | 'triangle' | 'squiggle' | 'capsule'

const PALETTE = ['#F2C230', '#F23DAE', '#CBDA2E', '#6478E0', '#C7B79C'] as const

export function accentFor(index: number): string {
  return PALETTE[index % PALETTE.length]
}

export function DecorativeShape({
  kind,
  color,
  size = 40,
  className = '',
  rotate = 0,
}: {
  kind: ShapeKind
  color: string
  size?: number
  className?: string
  rotate?: number
}) {
  const style = { width: size, height: size === 0 ? 0 : size, transform: `rotate(${rotate}deg)` } as const
  if (kind === 'circle') {
    return <div aria-hidden className={`shape-grain shrink-0 rounded-full ${className}`} style={{ ...style, background: color }} />
  }
  if (kind === 'triangle') {
    return (
      <svg aria-hidden width={size} height={size} viewBox="0 0 40 40" className={`shrink-0 ${className}`} style={{ transform: `rotate(${rotate}deg)` }}>
        <path d="M20 3 37 35H3Z" fill={color} />
      </svg>
    )
  }
  if (kind === 'capsule') {
    return <div aria-hidden className={`shape-grain shrink-0 ${className}`} style={{ width: size * 2.2, height: size * 0.62, borderRadius: 9999, background: color, transform: `rotate(${rotate}deg)` }} />
  }
  if (kind === 'squiggle') {
    return (
      <svg aria-hidden width={size * 2} height={size * 0.5} viewBox="0 0 80 20" className={`shrink-0 ${className}`} style={{ transform: `rotate(${rotate}deg)` }}>
        <path d="M2 12 Q 10 2, 18 12 T 34 12 T 50 12 T 66 12 T 82 12" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" />
      </svg>
    )
  }
  // sunburst — jagged hand-drawn star
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 48 48" className={`shrink-0 ${className}`} style={{ transform: `rotate(${rotate}deg)` }}>
      <path
        fill={color}
        d="M24 1l3.5 7 6.5-4.5 1 7.8 7.6-2 -1.6 7.7 7.7 1.6-4.6 6.4 6 5-7 3.6 2.4 7.5-7.7.6-.4 7.8-6.8-3.8-4.6 6.3-4.6-6.3-6.8 3.8-.4-7.8-7.7-.6 2.4-7.5-7-3.6 6-5-4.6-6.4 7.7-1.6-1.6-7.7 7.6 2 1-7.8 6.5 4.5z"
      />
    </svg>
  )
}

export function ShapeCluster({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none flex items-end gap-3 ${className}`}>
      <DecorativeShape kind="sunburst" color="#F2C230" size={44} rotate={-8} />
      <DecorativeShape kind="triangle" color="#3B332C" size={30} rotate={6} />
      <DecorativeShape kind="circle" color="#CBDA2E" size={30} />
      <DecorativeShape kind="capsule" color="#6478E0" size={22} rotate={-12} />
      <DecorativeShape kind="sunburst" color="#F5EFE4" size={26} rotate={14} />
    </div>
  )
}
