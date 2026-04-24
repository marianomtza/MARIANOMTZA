'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'

/**
 * Hero 3D background — renders LabScene as a full-bleed canvas behind the
 * hero content. Loaded lazily (SSR: false) to avoid WebGL on the server.
 * Theme changes are reflected live inside the scene via useTheme().
 */
const LabScene = dynamic(
  () => import('../lab/LabScene').then((m) => m.LabScene),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute inset-0"
        style={{ background: 'var(--bg)' }}
      />
    ),
  }
)

export function HeroBackground() {
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{ zIndex: 0 }}
    >
      <Suspense
        fallback={
          <div
            className="absolute inset-0"
            style={{ background: 'var(--bg)' }}
          />
        }
      >
        <LabScene asBackground />
      </Suspense>
    </div>
  )
}
