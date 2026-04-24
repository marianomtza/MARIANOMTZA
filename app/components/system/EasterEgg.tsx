'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useKonamiCode } from '../../hooks/useKonamiCode'

export function EasterEgg() {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const trigger = useCallback(() => {
    setVisible(true)
    confetti({
      particleCount: 220,
      spread: 90,
      startVelocity: 42,
      gravity: 0.9,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#7c3aed', '#22d3ee', '#f43f5e', '#f8fafc'],
      disableForReducedMotion: true,
    })
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => setVisible(false), 4200)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  useKonamiCode(trigger)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="night-mode"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] pointer-events-none"
        >
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 20% 20%, rgba(139,92,246,0.24), transparent 55%)',
                'radial-gradient(circle at 80% 30%, rgba(34,211,238,0.20), transparent 58%)',
                'radial-gradient(circle at 35% 70%, rgba(244,63,94,0.17), transparent 60%)',
              ],
            }}
            transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="glass rounded-3xl px-10 py-8 text-center border border-[var(--line-strong)]"
            >
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--accent)]">Konami unlocked</div>
              <div className="font-display text-5xl leading-[0.9] mt-2 text-[var(--fg)]">Afterhours</div>
              <div className="font-editorial text-lg text-[var(--fg-muted)] mt-2">La pista es tuya.</div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
