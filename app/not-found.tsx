'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[color:var(--bg)] px-6">
      <div className="w-full max-w-2xl rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-8 md:p-12">
        <p className="text-xs tracking-[0.22em] text-[color:var(--fg-muted)]">ERROR_NETWORK_DISCONNECTED</p>
        <h1 className="mt-4 text-4xl tracking-tight text-[color:var(--fg)] md:text-6xl">No internet, but still in the vibe.</h1>
        <p className="mt-5 max-w-[40ch] text-[color:var(--fg-muted)]">La página que buscabas no existe. Regresa al home y seguimos el recorrido curado.</p>
        <Link href="/" className="btn btn-primary btn-shine mt-8">Volver al inicio</Link>
      </div>
    </main>
  )
}
