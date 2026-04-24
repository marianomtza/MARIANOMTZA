import React, { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue } from 'framer-motion'

const ITEMS = ['SEKS', 'LUDBOY', 'KNOCKOUT', 'LA FAMA', 'Spotify', 'Hennessy', 'Bacardí', 'Zacapa', 'Four Loko', 'Zyn', 'Hypnotiq', 'Mezcal Verde', 'Viuda de Romero']

export const RotatingBar: React.FC = () => {
  const x = useMotionValue(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentWidth, setContentWidth] = useState(0)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (!contentRef.current) return
    setContentWidth(contentRef.current.offsetWidth / 2)
  }, [])

  useEffect(() => {
    let frame = 0
    let last = performance.now()

    const tick = (now: number) => {
      const dt = now - last
      last = now

      if (!dragging && contentWidth > 0) {
        const next = x.get() - dt * 0.035
        x.set(next <= -contentWidth ? 0 : next)
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [contentWidth, dragging, x])

  return (
    <section className="border-y border-[color:var(--line)] bg-[color:var(--surface-strong)] py-4">
      <motion.div
        className="cursor-grab active:cursor-grabbing"
        drag="x"
        dragElastic={0.03}
        dragMomentum={false}
        style={{ x }}
        onDragStart={() => setDragging(true)}
        onDragEnd={() => setDragging(false)}
      >
        <div ref={contentRef} className="flex w-max gap-4 px-6 md:px-12">
          {[...ITEMS, ...ITEMS].map((item, i) => (
            <div key={`${item}-${i}`} className="inline-flex items-center gap-4 text-[12px] uppercase tracking-[0.22em] text-[color:var(--fg-muted)]">
              <span>{item}</span>
              <span className="h-1 w-1 rounded-full bg-[color:var(--fg-muted)]/60" />
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
