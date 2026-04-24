'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useSound } from '../../contexts/SoundContext'

export function SoundToggle() {
  const { enabled, toggle } = useSound()

  return (
    <button
      onClick={toggle}
      aria-label={enabled ? 'PIANO ON' : 'PIANO OFF'}
      aria-pressed={enabled}
      className="glass group flex items-center gap-2.5 px-3.5 py-2.5 rounded-full text-[10px] font-mono tracking-[0.2em] uppercase hover:border-[var(--accent)] transition-colors"
    >
      <span className="flex items-center gap-[3px] h-3">
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="w-[2px] bg-[var(--fg)] rounded-full"
            animate={
              enabled
                ? { height: ['30%', '100%', '50%', '80%', '30%'][i % 5] }
                : { height: '30%' }
            }
            transition={
              enabled
                ? {
                    duration: 0.9 + i * 0.12,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                  }
                : { duration: 0.2 }
            }
            style={{ height: '30%' }}
          />
        ))}
      </span>
      <span className="text-[var(--fg-muted)] group-hover:text-[var(--fg)] transition-colors">
        {enabled ? 'PIANO ON' : 'PIANO OFF'}
      </span>
    </button>
  )
}
