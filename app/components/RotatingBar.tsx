'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'framer-motion'

export type RotatingEntry = { label: string; href?: string }

interface RotatingBarProps {
  entries: RotatingEntry[]
  direction?: 'left' | 'right'
  speed?: number
  ariaLabel: string
  variant?: 'projects' | 'brands'
}

export const RotatingBar: React.FC<RotatingBarProps> = ({
  entries,
  direction = 'left',
  speed = 70,
  ariaLabel,
  variant = 'brands',
}) => {
  const x = useMotionValue(0)
  const widthRef = useRef(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const dragOffsetRef = useRef(0)
  const lastTsRef = useRef(0)
  const didDragRef = useRef(false)
  const reduceMotion = useReducedMotion()

  const duplicated = useMemo(() => [...entries, ...entries], [entries])

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
  }, [duplicated])

  useAnimationFrame((ts) => {
    if (lastTsRef.current === 0) {
      lastTsRef.current = ts
      return
    }
    const dt = (ts - lastTsRef.current) / 1000
    lastTsRef.current = ts

    if (draggingRef.current) return
    const w = widthRef.current
    if (!w) return

    const multiplier = reduceMotion ? 0.35 : 1
    const delta = speed * multiplier * dt * (direction === 'left' ? -1 : 1)
    let next = x.get() + delta

    while (next <= -w) next += w
    while (next > 0) next -= w
    x.set(next)
  })

  return (
    <section className="relative border-y border-[var(--line)] py-7 overflow-hidden bg-[var(--bg)]" aria-label={ariaLabel}>
      <motion.div
        ref={trackRef}
        drag="x"
        dragConstraints={{ left: -Infinity, right: Infinity }}
        dragElastic={0}
        dragMomentum={false}
        style={{ x }}
        onDragStart={() => {
          draggingRef.current = true
          dragOffsetRef.current = x.get()
          didDragRef.current = false
        }}
        onDrag={(_, info) => {
          const w = widthRef.current
          if (!w) return
          if (Math.abs(info.offset.x) > 6) didDragRef.current = true
          let next = dragOffsetRef.current + info.offset.x
          while (next <= -w) next += w
          while (next > 0) next -= w
          x.set(next)
        }}
        onDragEnd={() => {
          draggingRef.current = false
        }}
        className="flex gap-10 whitespace-nowrap cursor-grab active:cursor-grabbing select-none"
      >
        {duplicated.map((entry, i) => {
          const content = (
            <motion.span
              whileHover={reduceMotion ? undefined : { scale: 1.02, rotate: -0.4, opacity: 0.96 }}
              className={`inline-flex items-center gap-3 font-display text-[clamp(1.8rem,4vw,3.4rem)] ${
                variant === 'projects' ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]'
              }`}
            >
              {entry.label}
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent)] opacity-70" />
            </motion.span>
          )

          if (!entry.href) {
            return <span key={`${entry.label}-${i}`}>{content}</span>
          }

          return (
            <Link
              key={`${entry.label}-${i}`}
              href={entry.href}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                if (didDragRef.current) e.preventDefault()
              }}
            >
              {content}
            </Link>
          )
        })}
      </motion.div>
    </section>
  )
}
