'use client'

import React from 'react'
import Link from 'next/link'
import { useScrollEngine } from '../hooks/useScrollEngine'
import { CreativeGallery } from '../components/inspiracion/CreativeGallery'
import { ParticleField } from '../components/system/ParticleField'

export default function InspiracionPage() {
  useScrollEngine()

  return (
    <main className="relative bg-[var(--bg)] text-[var(--fg)] overflow-hidden">
      <ParticleField />
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur">
        <div className="max-w-6xl mx-auto h-16 px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="text-sm tracking-[0.2em] uppercase">← Volver</Link>
          <div className="text-xs text-[var(--fg-muted)]">Creative Playground</div>
        </div>
      </header>
      <CreativeGallery />
    </main>
  )
}
