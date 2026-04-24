'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { motion, useReducedMotion } from 'framer-motion'

const HeroScene3D = dynamic(() => import('./HeroScene3D').then((m) => m.HeroScene3D), { ssr: false })

export function HeroBackground() {
  const reduced = useReducedMotion()

  return (
    <div aria-hidden className="noise absolute inset-0 overflow-hidden pointer-events-none" style={{ background: 'var(--bg)' }}>
      {!reduced && <HeroScene3D />}

      <motion.div
        className="absolute inset-0"
        animate={reduced ? undefined : { opacity: [0.12, 0.2, 0.14] }}
        transition={{ repeat: Infinity, duration: 4.4, ease: 'easeInOut' }}
        style={{ background: 'radial-gradient(circle at 40% 35%, var(--accent-glow), transparent 58%)' }}
      />

      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,.18), transparent 20%, transparent 78%, rgba(0,0,0,.28))' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 95% 80% at 50% 50%, transparent 32%, var(--bg) 100%)' }} />
    </div>
  )
}
