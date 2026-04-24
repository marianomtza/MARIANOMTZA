'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
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
  const groupRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [repeats, setRepeats] = useState(4)
  const groupWidthRef = useRef(0)

  const draggingRef = useRef(false)
  const dragOffsetRef = useRef(0)
  const lastTsRef = useRef(0)
  const didDragRef = useRef(false)
  const reduceMotion = useReducedMotion()

  const repeatedGroup = useMemo(
    () => Array.from({ length: repeats }).flatMap((_, cycle) => entries.map((entry) => ({ ...entry, cycle }))),
    [entries, repeats]
  )

  useEffect(() => {
    const measure = () => {
      if (!groupRef.current || !wrapperRef.current) return
      const viewportW = wrapperRef.current.clientWidth
      const originalW = groupRef.current.scrollWidth || 1
      const needed = Math.max(3, Math.ceil((viewportW * 3) / originalW))
      setRepeats(needed)
      groupWidthRef.current = originalW * needed
    }

    measure()
    const ro = new ResizeObserver(measure)
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [entries])

  useAnimationFrame((ts) => {
    if (lastTsRef.current === 0) {
      lastTsRef.current = ts
      return
    }
    const dt = (ts - lastTsRef.current) / 1000
    lastTsRef.current = ts

    if (draggingRef.current) return
    const groupW = groupWidthRef.current
    if (!groupW) return

    const multiplier = reduceMotion ? 0.35 : 1
    const delta = speed * multiplier * dt * (direction === 'left' ? -1 : 1)
    let next = x.get() + delta

    while (next <= -groupW) next += groupW
    while (next > 0) next -= groupW
    x.set(next)
  })

  const itemClass = `inline-flex items-center gap-3 font-display text-[clamp(1.8rem,4vw,3.4rem)] transition ${
    variant === 'projects' ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]'
  }`

  return (
    <section className="relative border-y border-[var(--line)] py-7 overflow-hidden bg-[var(--bg)]" aria-label={ariaLabel}>
      <div ref={wrapperRef} className="overflow-hidden">
        <motion.div
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
            const groupW = groupWidthRef.current
            if (!groupW) return
            if (Math.abs(info.offset.x) > 6) didDragRef.current = true
            let next = dragOffsetRef.current + info.offset.x
            while (next <= -groupW) next += groupW
            while (next > 0) next -= groupW
            x.set(next)
          }}
          onDragEnd={() => {
            draggingRef.current = false
          }}
          className="flex gap-12 whitespace-nowrap cursor-grab active:cursor-grabbing select-none"
        >
          {[0, 1].map((stream) => (
            <div key={stream} ref={stream === 0 ? groupRef : undefined} className="flex gap-12">
              {repeatedGroup.map((entry, i) => {
                const content = (
                  <motion.span whileHover={reduceMotion ? undefined : { scale: 1.03, y: -1 }} className={itemClass}>
                    <span className="no-underline">{entry.label}</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)]/75" />
                  </motion.span>
                )

                if (!entry.href) {
                  return <span key={`${entry.label}-${entry.cycle}-${i}`}>{content}</span>
                }

                return (
                  <Link
                    key={`${entry.label}-${entry.cycle}-${i}`}
                    href={entry.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-inherit no-underline"
                    onClick={(e) => {
                      if (didDragRef.current) e.preventDefault()
                    }}
                  >
                    {content}
                  </Link>
                )
              })}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
