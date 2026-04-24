'use client'

import React, { useEffect, useRef } from 'react'
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion'

export interface BarEntry {
  label: string
  type: 'project' | 'brand'
  url?: string
}

interface RotatingBarProps {
  entries: BarEntry[]
}

const PIXELS_PER_SECOND = 70

export const RotatingBar: React.FC<RotatingBarProps> = ({ entries }) => {
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
    while (next <= -w) next += w
    while (next > 0) next -= w
    x.set(next)
  }

  const handleDragEnd = () => {
    draggingRef.current = false
  }

  // Duplicate for seamless loop
  const doubled = [...entries, ...entries]

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
          {doubled.map((entry, i) => {
            const dot = (
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{
                  background:
                    entry.type === 'project' ? 'var(--accent)' : 'var(--accent-soft)',
                  opacity: 0.7,
                }}
              />
            )

            const inner = (
              <>
                {entry.label}
                {dot}
              </>
            )

            if (entry.url) {
              return (
                <a
                  key={`${entry.label}-${i}`}
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  // Prevent navigation during drag
                  onClick={(e) => { if (draggingRef.current) e.preventDefault() }}
                  className="inline-flex items-center gap-4 font-display text-[clamp(2rem,5vw,4rem)] text-[var(--fg)] hover:text-[var(--accent)] transition-colors duration-200"
                >
                  {inner}
                </a>
              )
            }

            return (
              <span
                key={`${entry.label}-${i}`}
                className="inline-flex items-center gap-4 font-display text-[clamp(2rem,5vw,4rem)] text-[var(--fg)]"
              >
                {inner}
              </span>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
