'use client'

import React, { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'

export function HeroBackground() {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const pulse = useMotionValue(0)
  const reduced = useReducedMotion()

  const smx = useSpring(mx, { stiffness: 60, damping: 22, mass: 1.4 })
  const smy = useSpring(my, { stiffness: 60, damping: 22, mass: 1.4 })
  const fastX = useSpring(mx, { stiffness: 100, damping: 20, mass: 0.8 })
  const fastY = useSpring(my, { stiffness: 100, damping: 20, mass: 0.8 })

  useEffect(() => {
    if (reduced) return
    const onMove = (e: PointerEvent) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      mx.set((e.clientX - rect.left) / rect.width)
      my.set((e.clientY - rect.top) / rect.height)
    }
    const id = window.setInterval(() => pulse.set((Math.sin(performance.now() / 500) + 1) * 0.5), 120)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      clearInterval(id)
      window.removeEventListener('pointermove', onMove)
    }
  }, [mx, my, pulse, reduced])

  const b1x = useTransform(smx, [0, 1], ['-6%', '6%'])
  const b1y = useTransform(smy, [0, 1], ['-4%', '4%'])
  const b2x = useTransform(smx, [0, 1], ['5%', '-5%'])
  const b2y = useTransform(smy, [0, 1], ['4%', '-4%'])
  const b3x = useTransform(fastX, [0, 1], ['-10%', '10%'])
  const b3y = useTransform(fastY, [0, 1], ['-7%', '7%'])
  const waveOpacity = useTransform(pulse, [0, 1], [0.08, 0.2])

  return (
    <div ref={ref} aria-hidden className="noise absolute inset-0 overflow-hidden pointer-events-none" style={{ background: 'var(--bg)' }}>
      <motion.div className="absolute -top-1/2 -left-1/3 w-[110vw] h-[110vw] rounded-full blur-[180px] opacity-50" style={{ background: 'radial-gradient(circle at 30% 30%, var(--accent-glow) 0%, transparent 55%)', x: reduced ? 0 : b1x, y: reduced ? 0 : b1y }} />
      <motion.div className="absolute -bottom-1/2 -right-1/4 w-[90vw] h-[90vw] rounded-full blur-[160px] opacity-40" style={{ background: 'radial-gradient(circle, var(--accent-soft) 0%, var(--accent-glow) 40%, transparent 65%)', x: reduced ? 0 : b2x, y: reduced ? 0 : b2y, mixBlendMode: 'screen' }} />
      <motion.div className="absolute -top-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-30" style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 60%)', x: reduced ? 0 : b3x, y: reduced ? 0 : b3y, mixBlendMode: 'screen' }} />

      <motion.div className="absolute inset-0" style={{ opacity: reduced ? 0.08 : waveOpacity, background: 'repeating-linear-gradient(100deg, transparent 0 20px, rgba(155,95,214,.15) 22px, transparent 40px)', maskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, black 28%, transparent 78%)' }} />

      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 35%, var(--bg) 100%)' }} />
    </div>
  )
}
