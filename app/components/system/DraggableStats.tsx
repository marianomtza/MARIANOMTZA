'use client'

import React from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const stats = [
  { label: 'KNOCKOUT', value: 90 },
  { label: 'LA FAMA', value: 84 },
  { label: 'SEKS', value: 76 },
  { label: 'LUDBOY', value: 88 },
]

export function DraggableStats() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const smoothX = useSpring(x, { stiffness: 220, damping: 24 })
  const smoothY = useSpring(y, { stiffness: 220, damping: 24 })

  return (
    <motion.aside
      drag
      dragElastic={0.12}
      style={{ x: smoothX, y: smoothY }}
      className="w-full max-w-sm rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)]/90 backdrop-blur p-5"
      aria-label="Módulo de métricas arrastrable"
    >
      <h3 className="text-sm font-semibold tracking-[0.16em] text-[var(--fg-muted)] mb-4">STATS MODULE</h3>
      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="mb-2 flex justify-between text-xs">
              <span>{stat.label}</span>
              <span>{stat.value}</span>
            </div>
            <div className="h-2 rounded-full bg-black/30 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${stat.value}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-soft)]"
              />
            </div>
          </div>
        ))}
      </div>
    </motion.aside>
  )
}
