'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'

// ── Lazy-load LabScene (no SSR) ───────────────────────────────────────────────
const LabScene = dynamic(
  () => import('../lab/LabScene').then(m => ({ default: m.LabScene })),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute inset-0"
        style={{ background: 'var(--bg, #0a0712)' }}
      />
    ),
  },
)

export function HeroBackground() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ background: 'var(--bg, #0a0712)' }}
    >
      {/* WebGL scene */}
      <div className="absolute inset-0">
        <Suspense
          fallback={
            <div className="absolute inset-0" style={{ background: 'var(--bg, #0a0712)' }} />
          }
        >
          <LabScene asBackground />
        </Suspense>
      </div>

      {/* Vignette — pulls focus to center, softens edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 85% 80% at 50% 48%, transparent 30%, rgba(10,7,18,0.92) 100%)',
        }}
      />

      {/* Top fade — navbar legibility */}
      <div
        className="absolute top-0 left-0 right-0 h-40"
        style={{
          background: 'linear-gradient(to bottom, rgba(10,7,18,0.6) 0%, transparent 100%)',
        }}
      />

      {/* Bottom fade — smooth section transition */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48"
        style={{
          background: 'linear-gradient(to top, var(--bg, #0a0712) 0%, transparent 100%)',
        }}
      />

      {/* Noise overlay — subtle film grain */}
      <div
        className="absolute inset-0 opacity-[0.032]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  )
}
