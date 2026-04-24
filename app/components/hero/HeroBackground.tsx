'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const HeroScene3D = dynamic(() => import('./HeroScene3D'), { ssr: false })

export function HeroBackground() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 z-0 bg-[var(--bg)]" />
      <HeroScene3D />
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_50%_45%,transparent_22%,var(--bg)_90%)]" />
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(to_bottom,var(--bg)_0%,transparent_14%,transparent_86%,var(--bg)_100%)] opacity-90" />
      <div className="noise absolute inset-0 z-[1] opacity-60" />
    </div>
  )
}
