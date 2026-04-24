'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const LabScene = dynamic(() => import('../components/lab/LabScene').then((m) => m.LabScene), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="font-mono text-[11px] tracking-[0.28em] text-[var(--fg-muted)] uppercase">
        Cargando escena
      </div>
    </div>
  ),
})

export default function LabPage() {
  return (
    <main className="relative min-h-screen bg-[var(--bg)] text-[var(--fg)] overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-20 border-b border-[var(--line)] bg-[var(--bg)]/50 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto h-16 px-6 md:px-12 flex items-center justify-between">
          <Link
            href="/"
            className="font-mono text-[11px] tracking-[0.28em] uppercase text-[var(--fg-muted)] hover:text-[var(--fg)] transition"
          >
            ← Volver
          </Link>
          <div className="font-mono text-[11px] tracking-[0.28em] uppercase text-[var(--fg-muted)]">
            Lab · Experimento 01
          </div>
        </div>
      </header>

      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <LabScene />
        </Suspense>
      </div>

      <div className="relative z-10 min-h-screen pointer-events-none flex flex-col justify-end p-6 md:p-12">
        <div className="max-w-[520px] pointer-events-auto">
          <div className="font-mono text-[11px] tracking-[0.28em] text-[var(--accent)] mb-4 uppercase">
            Playground · R3F
          </div>
          <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.02em] text-[var(--fg)] mb-6">
            Experimentos sonoros <br />
            y visuales.
          </h1>
          <p className="font-editorial text-lg text-[var(--fg-muted)] max-w-[40ch]">
            Un espacio paralelo al booking. Escenas interactivas, pruebas de dirección y material
            de presentación.
          </p>
        </div>
      </div>
    </main>
  )
}
