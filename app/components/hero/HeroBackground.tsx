'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const DynamicHeroScene3D = dynamic(
  () => import('./HeroScene3D').then((m) => m.HeroScene3D),
  { ssr: false }
)

export function HeroBackground() {
  return (
    <div
      aria-hidden
      className="noise absolute inset-0 overflow-hidden pointer-events-none"
      style={{ background: 'var(--bg)' }}
    >
      <DynamicHeroScene3D />

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 92% 70% at 50% 45%, transparent 32%, color-mix(in oklab, var(--bg) 82%, black) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, color-mix(in oklab, var(--bg) 95%, black) 0%, transparent 18%, transparent 86%, color-mix(in oklab, var(--bg) 90%, black) 100%)',
        }}
      />
    </div>
  )
}
