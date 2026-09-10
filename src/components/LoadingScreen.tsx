import { DecorativeShape } from './DecorativeShape'

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: '#FAF6ED' }}>
      <div className="flex items-center gap-3 font-semibold" style={{ color: '#6E6153' }}>
        <span className="inline-block animate-spin"><DecorativeShape kind="sunburst" color="#F2C230" size={28} /></span>
        Loading…
      </div>
    </div>
  )
}
