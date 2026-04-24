'use client'

import React, { useEffect, useRef } from 'react'
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion'

export type RotatingEntry = { label: string; href?: string }

const PIXELS_PER_SECOND = 70

export const RotatingBar: React.FC<{ entries: RotatingEntry[] }> = ({ entries }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const widthRef = useRef(0)
  const draggingRef = useRef(false)
  const hoveringRef = useRef(false)
  const dragOffsetRef = useRef(0)
  const lastTsRef = useRef<number>(0)

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return
      widthRef.current = trackRef.current.scrollWidth / 2
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (trackRef.current) ro.observe(trackRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  useAnimationFrame((ts) => {
    if (lastTsRef.current === 0) {
      lastTsRef.current = ts
      return
    }
    const dt = (ts - lastTsRef.current) / 1000
    lastTsRef.current = ts

    if (draggingRef.current || hoveringRef.current) return
    const w = widthRef.current
    if (!w) return

    let next = x.get() - PIXELS_PER_SECOND * dt
    if (next <= -w) next += w
    x.set(next)
  })

  const handleDragStart = () => {
    draggingRef.current = true
    dragOffsetRef.current = x.get()
  }

  const handleDrag = (_: unknown, info: { offset: { x: number } }) => {
    const w = widthRef.current
    if (!w) return
    let next = dragOffsetRef.current + info.offset.x
    // wrap into [-w, 0]
    while (next <= -w) next += w
    while (next > 0) next -= w
    x.set(next)
  }

  const handleDragEnd = () => {
    draggingRef.current = false
  }

  return (
    <section className="relative border-y border-[var(--line)] py-8 overflow-hidden bg-[var(--bg)]">
      <div
        ref={containerRef}
        className="cursor-grab select-none"
        onPointerEnter={() => (hoveringRef.current = true)}
        onPointerLeave={() => (hoveringRef.current = false)}
      >
        <motion.div
          ref={trackRef}
          drag="x"
          dragConstraints={{ left: -Infinity, right: Infinity }}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className="flex gap-12 whitespace-nowrap"
        >
          {[...entries, ...entries].map((entry, i) => (
            <a
              key={`${entry.label}-${i}`}
              href={entry.href}
              target={entry.href ? '_blank' : undefined}
              rel={entry.href ? 'noreferrer noopener' : undefined}
              className="inline-flex items-center gap-4 font-display text-[clamp(2rem,5vw,4rem)] text-[var(--fg)]"
            >
              {entry.label}
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{
                  background: entry.href ? 'var(--accent)' : 'var(--accent-soft)',
                  opacity: 0.7,
                }}
              />
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
