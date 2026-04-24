'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { THEMES, THEME_LABELS, ThemeName, themeTokens } from '../../lib/design-tokens'
import { useTheme } from '../../contexts/ThemeContext'

const PREVIEW: Record<ThemeName, string> = {
  base: themeTokens.base['--accent'],
  dark: themeTokens.dark['--accent'],
  light: themeTokens.light['--accent'],
  rojo: themeTokens.rojo['--accent'],
  azul: themeTokens.azul['--accent'],
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="glass group flex items-center gap-2.5 px-3.5 py-2.5 rounded-full text-[10px] font-mono tracking-[0.2em] uppercase hover:border-[var(--accent)] transition-colors"
        aria-label="Cambiar tema"
        aria-expanded={open}
      >
        <span
          className="w-3 h-3 rounded-full border border-[var(--line-strong)]"
          style={{ background: PREVIEW[theme] }}
        />
        <span className="text-[var(--fg-muted)] group-hover:text-[var(--fg)] transition-colors">
          {THEME_LABELS[theme]}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="glass absolute left-0 bottom-full mb-2 rounded-2xl p-2 min-w-[180px]"
          >
            {THEMES.map((name) => (
              <button
                key={name}
                onClick={() => {
                  setTheme(name)
                  setOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] font-mono tracking-[0.2em] uppercase transition-colors ${
                  theme === name
                    ? 'bg-[var(--bg-elevated)] text-[var(--fg)]'
                    : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-elevated)]/60'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-[var(--line-strong)] flex-shrink-0"
                  style={{ background: PREVIEW[name] }}
                />
                {THEME_LABELS[name]}
                {theme === name && (
                  <span className="ml-auto text-[var(--accent)]" aria-hidden>
                    ·
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
