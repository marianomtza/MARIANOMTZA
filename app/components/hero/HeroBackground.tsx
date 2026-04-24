'use client'

import React, { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Layered editorial background — multi-depth, 3D-feeling.
 * - 5 spring-driven parallax layers at different depths
 * - SVG noise overlay (theme-aware opacity)
 * - Vignette + ambient glow
 * - No WebGL — purely GPU compositing
 */
export function HeroBackground() {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)

  const smx = useSpring(mx, { stiffness: 60, damping: 22, mass: 1.4 })
  const smy = useSpring(my, { stiffness: 60, damping: 22, mass: 1.4 })

  // Faster spring for closer layers
  const fastX = useSpring(mx, { stiffness: 100, damping: 20, mass: 0.8 })
  const fastY = useSpring(my, { stiffness: 100, damping: 20, mass: 0.8 })

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const onMove = (e: PointerEvent) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      mx.set(x)
      my.set(y)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [mx, my])

  // Far layer (slow, subtle)
  const b1x = useTransform(smx, [0, 1], ['-6%', '6%'])
  const b1y = useTransform(smy, [0, 1], ['-4%', '4%'])
  // Mid layer
  const b2x = useTransform(smx, [0, 1], ['5%', '-5%'])
  const b2y = useTransform(smy, [0, 1], ['4%', '-4%'])
  // Near layer (faster)
  const b3x = useTransform(fastX, [0, 1], ['-10%', '10%'])
  const b3y = useTransform(fastY, [0, 1], ['-7%', '7%'])
  // Accent highlight
  const b4x = useTransform(fastX, [0, 1], ['8%', '-8%'])
  const b4y = useTransform(fastY, [0, 1], ['6%', '-6%'])
  // Deep center
  const b5x = useTransform(smx, [0, 1], ['-3%', '3%'])
  const b5y = useTransform(smy, [0, 1], ['-2%', '2%'])

  return (
    <div
      ref={ref}
      aria-hidden
      className="noise absolute inset-0 overflow-hidden pointer-events-none"
      style={{ background: 'var(--bg)' }}
    >
      {/* Layer 1: Far — large ambient blob top-left */}
      <motion.div
        className="absolute -top-1/2 -left-1/3 w-[110vw] h-[110vw] rounded-full blur-[180px] opacity-50"
        style={{
          background: 'radial-gradient(circle at 30% 30%, var(--accent-glow) 0%, transparent 55%)',
          x: b1x,
          y: b1y,
        }}
      />

      {/* Layer 2: Mid — bottom-right counter-blob */}
      <motion.div
        className="absolute -bottom-1/2 -right-1/4 w-[90vw] h-[90vw] rounded-full blur-[160px] opacity-40"
        style={{
          background:
            'radial-gradient(circle, var(--accent-soft) 0%, var(--accent-glow) 40%, transparent 65%)',
          x: b2x,
          y: b2y,
          mixBlendMode: 'screen',
        }}
      />

      {/* Layer 3: Near — tighter glow top-right */}
      <motion.div
        className="absolute -top-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-30"
        style={{
          background: 'radial-gradient(circle, var(--accent) 0%, transparent 60%)',
          x: b3x,
          y: b3y,
          mixBlendMode: 'screen',
        }}
      />

      {/* Layer 4: Accent highlight — small, vivid, bottom-left */}
      <motion.div
        className="absolute bottom-0 left-[10%] w-[40vw] h-[40vw] rounded-full blur-[100px] opacity-25"
        style={{
          background: 'radial-gradient(circle, var(--accent-deep) 0%, transparent 70%)',
          x: b4x,
          y: b4y,
        }}
      />

      {/* Layer 5: Deep center — large, very faint, anchors everything */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full blur-[200px] opacity-20"
        style={{
          background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
          x: b5x,
          y: b5y,
        }}
      />

      {/* Subtle grid — depth cue, masked to center */}
      <div
        className="absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage:
            'linear-gradient(var(--fg) 1px, transparent 1px), linear-gradient(90deg, var(--fg) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage:
            'radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 75%)',
        }}
      />

      {/* Perspective lines — converging toward center bottom for 3D depth */}
      <div
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(170deg, var(--fg) 0px, transparent 1px, transparent 80px, var(--fg) 81px)',
          maskImage: 'radial-gradient(ellipse at 50% 100%, black 0%, transparent 60%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 100%, black 0%, transparent 60%)',
        }}
      />

      {/* Vignette — pulls focus to center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 35%, var(--bg) 100%)',
        }}
      />

      {/* Edge darkening */}
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
