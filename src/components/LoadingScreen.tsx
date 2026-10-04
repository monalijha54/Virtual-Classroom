export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex items-center gap-3 font-medium" style={{ color: '#555a6a' }}>
        <div className="h-5 w-5 animate-spin rounded-full border-2" style={{ borderColor: '#eef0f3', borderTopColor: '#4262ff' }} />
        Loading…
      </div>
    </div>
  )
}
