export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: '#FAF6ED' }}>
      <div className="flex items-center gap-3 font-semibold" style={{ color: '#6E6153' }}>
        <div className="h-5 w-5 animate-spin rounded-full border-2" style={{ borderColor: '#E4DBCB', borderTopColor: '#18130F' }} />
        Loading…
      </div>
    </div>
  )
}
