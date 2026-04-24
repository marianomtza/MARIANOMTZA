'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const LabScene = dynamic(
  () => import('../lab/LabScene').then((module) => module.LabScene),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-[var(--bg)]" aria-hidden />,
  }
)

export function HeroBackground() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      <LabScene asBackground />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_25%,var(--bg)_95%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--bg)_0%,transparent_14%,transparent_86%,var(--bg)_100%)] opacity-90" />
      <div className="noise absolute inset-0 opacity-70" />
    </div>
  )
}
