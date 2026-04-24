'use client'

import React, { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export function HeroBackground() {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)

  const smx = useSpring(mx, { stiffness: 70, damping: 21, mass: 1.2 })
  const smy = useSpring(my, { stiffness: 70, damping: 21, mass: 1.2 })
  const fastX = useSpring(mx, { stiffness: 120, damping: 19, mass: 0.78 })
  const fastY = useSpring(my, { stiffness: 120, damping: 19, mass: 0.78 })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      mx.set(Math.min(1, Math.max(0, x)))
      my.set(Math.min(1, Math.max(0, y)))
    }

    const onLeave = () => {
      mx.set(0.5)
      my.set(0.5)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [mx, my])

  const b1x = useTransform(smx, [0, 1], ['-7%', '7%'])
  const b1y = useTransform(smy, [0, 1], ['-5%', '5%'])
  const b2x = useTransform(smx, [0, 1], ['6%', '-6%'])
  const b2y = useTransform(smy, [0, 1], ['4%', '-4%'])
  const b3x = useTransform(fastX, [0, 1], ['-12%', '12%'])
  const b3y = useTransform(fastY, [0, 1], ['-8%', '8%'])
  const noteX = useTransform(fastX, [0, 1], ['-18px', '18px'])
  const noteY = useTransform(fastY, [0, 1], ['16px', '-16px'])

  return (
    <div
      ref={ref}
      aria-hidden
      className="noise absolute inset-0 overflow-hidden pointer-events-none"
      style={{ background: 'var(--bg)' }}
    >
      <motion.div
        className="absolute -top-1/2 -left-1/3 w-[110vw] h-[110vw] rounded-full blur-[180px] opacity-50"
        style={{
          background: 'radial-gradient(circle at 30% 30%, var(--accent-glow) 0%, transparent 55%)',
          x: b1x,
          y: b1y,
        }}
      />

      <motion.div
        className="absolute -bottom-1/2 -right-1/4 w-[90vw] h-[90vw] rounded-full blur-[160px] opacity-42"
        style={{
          background:
            'radial-gradient(circle, var(--accent-soft) 0%, var(--accent-glow) 40%, transparent 65%)',
          x: b2x,
          y: b2y,
          mixBlendMode: 'screen',
        }}
      />

      <motion.div
        className="absolute -top-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-30"
        style={{
          background: 'radial-gradient(circle, var(--accent) 0%, transparent 60%)',
          x: b3x,
          y: b3y,
          mixBlendMode: 'screen',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0 56px, var(--fg) 56px 57px, transparent 57px 70px)',
          maskImage: 'radial-gradient(ellipse 90% 75% at 50% 45%, black 25%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 90% 75% at 50% 45%, black 25%, transparent 75%)',
        }}
      />

      <motion.div
        className="absolute inset-0 opacity-[0.08]"
        style={{ x: noteX, y: noteY }}
      >
        <div className="absolute top-[16%] left-[12%] text-[22px] text-[var(--accent-soft)]">♪</div>
        <div className="absolute top-[44%] right-[14%] text-[18px] text-[var(--accent)]">♬</div>
        <div className="absolute bottom-[20%] left-[28%] text-[20px] text-[var(--accent-deep)]">♫</div>
      </motion.div>

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 35%, var(--bg) 100%)',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, var(--bg) 0%, transparent 8%, transparent 88%, var(--bg) 100%)',
        }}
      />
    </div>
  )
}
