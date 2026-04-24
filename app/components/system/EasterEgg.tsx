'use client'

/**
 * EasterEgg — elegant Konami code trigger.
 * Up Up Down Down Left Right Left Right B A → brief centered flash + confetti.
 * No blocking overlay. No debug displays. Clean and intentional.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKonamiCode } from '../../hooks/useKonamiCode'
import confetti from 'canvas-confetti'

const EASE = [0.22, 1, 0.36, 1] as const

export function EasterEgg() {
  const [visible, setVisible] = useState(false)

  const trigger = useCallback(() => {
    setVisible(true)
    confetti({
      particleCount: 160,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#8b5cf6', '#a78bfa', '#eae4f5', '#5b21b6'],
      disableForReducedMotion: true,
    })
    const t = window.setTimeout(() => setVisible(false), 3200)
    return () => window.clearTimeout(t)
  }, [])

  useKonamiCode(trigger)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="egg"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
        >
          <div className="glass rounded-3xl px-12 py-10 text-center max-w-[340px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
            <div className="font-mono text-[10px] tracking-[0.32em] text-[var(--accent)] mb-3 uppercase">
              · Easter Egg ·
            </div>
            <div className="font-display text-[2.4rem] leading-[0.92] tracking-[-0.02em] text-[var(--fg)] mb-2">
              Lo encontraste.
            </div>
            <div className="font-editorial text-base text-[var(--fg-muted)] italic">
              Sabías lo que buscabas.
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
