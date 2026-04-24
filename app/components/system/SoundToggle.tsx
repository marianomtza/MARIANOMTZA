'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useSound } from '../../contexts/SoundContext'

export function SoundToggle() {
  const { enabled, toggle } = useSound()
  const reduceMotion = useReducedMotion()

  return (
    <button
      onClick={toggle}
      aria-label={enabled ? 'Desactivar piano' : 'Activar piano'}
      aria-pressed={enabled}
      title={enabled ? 'Piano activado' : 'Piano desactivado'}
      className="glass group flex items-end gap-1.5 px-3 py-2.5 min-h-11 rounded-full hover:border-[var(--accent)] transition-colors"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-[var(--fg)]"
          initial={false}
          animate={
            enabled
              ? {
                  opacity: [0.48, 0.95, 0.6, 0.9],
                  height: reduceMotion ? ['8px', '12px'] : [`${8 + i * 2}px`, `${14 + i * 4}px`, `${10 + i * 2}px`],
                }
              : { opacity: 0.38, height: '8px' }
          }
          transition={
            enabled
              ? {
                  duration: reduceMotion ? 1.6 : 0.9 + i * 0.16,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </button>
  )
}
