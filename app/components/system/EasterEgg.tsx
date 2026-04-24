'use client'

import React, { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useKonamiCode } from '../../hooks/useKonamiCode'

export function EasterEgg() {
  const [visible, setVisible] = useState(false)

  const trigger = useCallback(() => {
    setVisible(true)
    const palette = ['#8b5cf6', '#c084fc', '#f472b6', '#38bdf8', '#fef08a']
    confetti({ particleCount: 120, spread: 70, origin: { x: 0.15, y: 0.7 }, angle: 60, scalar: 1.1, colors: palette })
    confetti({ particleCount: 120, spread: 70, origin: { x: 0.85, y: 0.7 }, angle: 120, scalar: 1.1, colors: palette })
    confetti({ particleCount: 60, spread: 110, origin: { y: 0.52 }, scalar: 1.4, colors: palette })

    const t = window.setTimeout(() => setVisible(false), 3400)
    return () => window.clearTimeout(t)
  }, [])

  useKonamiCode(trigger)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
          <motion.div initial={{ scale: 0.92, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }} className="glass rounded-3xl px-12 py-10 text-center max-w-[370px] border border-[var(--accent)]/30 shadow-[0_30px_80px_-20px_rgba(139,92,246,.55)]">
            <div className="font-mono text-[10px] tracking-[0.32em] text-[var(--accent)] mb-3 uppercase">Night mode unlocked</div>
            <div className="font-display text-[2.5rem] leading-[0.92] tracking-[-0.02em] text-[var(--fg)] mb-2">Lo encontraste.</div>
            <div className="font-editorial text-base text-[var(--fg-muted)] italic">Sube el volumen. Esto recién empieza.</div>
            <div className="mt-4 flex justify-center gap-1">
              {new Array(9).fill(0).map((_, i) => (
                <motion.span key={i} className="w-[3px] rounded-full bg-[var(--accent)]" animate={{ height: [4, 18 + (i % 3) * 8, 6] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.05 }} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
