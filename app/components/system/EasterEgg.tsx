'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useKonamiCode } from '../../hooks/useKonamiCode'
import confetti from 'canvas-confetti'

export function EasterEgg() {
  const [visible, setVisible] = useState(false)
  const reduceMotion = useReducedMotion()

  const trigger = useCallback(() => {
    setVisible(true)
    confetti({
      particleCount: reduceMotion ? 60 : 160,
      spread: reduceMotion ? 40 : 95,
      origin: { y: 0.62 },
      colors: ['#8b5cf6', '#a78bfa', '#f0abfc', '#e9d5ff'],
      disableForReducedMotion: true,
    })
    window.setTimeout(() => setVisible(false), reduceMotion ? 1200 : 2000)
  }, [reduceMotion])

  useKonamiCode(trigger)

  useEffect(() => {
    const handle = () => trigger()
    window.addEventListener('mmtza-party', handle)
    return () => window.removeEventListener('mmtza-party', handle)
  }, [trigger])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="egg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[120] pointer-events-none overflow-hidden"
        >
          <motion.div
            className="absolute -inset-[30%]"
            animate={reduceMotion ? { opacity: [0.2, 0] } : { rotate: [0, 8, -8, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: reduceMotion ? 0.9 : 1.8, ease: 'easeOut' }}
            style={{
              background:
                'conic-gradient(from 140deg at 50% 50%, rgba(139,92,246,0.36), rgba(167,139,250,0.14), rgba(240,171,252,0.26), rgba(91,33,182,0.08), rgba(139,92,246,0.36))',
              filter: 'blur(28px)',
            }}
          />
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.12, 0.22, 0.05, 0] }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
            style={{
              background:
                'radial-gradient(circle at 50% 60%, rgba(155,95,214,0.55), rgba(10,7,18,0) 60%)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
