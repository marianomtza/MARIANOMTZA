'use client'

import dynamic from 'next/dynamic'

const LabScene = dynamic(() => import('../lab/LabScene').then((mod) => mod.LabScene), {
  ssr: false,
  loading: () => <div className="absolute inset-0" style={{ background: 'var(--bg)' }} />,
})

export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <LabScene asBackground />
    </div>
  )
}
