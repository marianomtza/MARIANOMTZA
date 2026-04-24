'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { THEMES, THEME_LABELS, ThemeName, themeTokens } from '../../lib/design-tokens'
import { useTheme } from '../../contexts/ThemeContext'

const PREVIEW: Record<ThemeName, { bg: string; accent: string }> = {
  base: { bg: themeTokens.base['--bg-elevated'], accent: themeTokens.base['--accent'] },
  dark: { bg: themeTokens.dark['--bg-elevated'], accent: themeTokens.dark['--accent'] },
  light: { bg: themeTokens.light['--bg-elevated'], accent: themeTokens.light['--accent'] },
  rojo: { bg: themeTokens.rojo['--bg-elevated'], accent: themeTokens.rojo['--accent'] },
  azul: { bg: themeTokens.azul['--bg-elevated'], accent: themeTokens.azul['--accent'] },
}

function ThemeChip({ theme }: { theme: ThemeName }) {
  return (
    <span
      className="w-5 h-5 rounded-full border border-[var(--line-strong)] overflow-hidden flex-shrink-0"
      aria-hidden
    >
      <span className="block h-1/2 w-full" style={{ background: PREVIEW[theme].bg }} />
      <span className="block h-1/2 w-full" style={{ background: PREVIEW[theme].accent }} />
    </span>
  )
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="glass group flex items-center gap-2.5 px-3.5 py-2.5 min-h-11 rounded-full text-[10px] font-mono tracking-[0.2em] uppercase hover:border-[var(--accent)] transition-colors"
        aria-label="Cambiar tema"
        aria-expanded={open}
      >
        <ThemeChip theme={theme} />
        <span className="text-[var(--fg-muted)] group-hover:text-[var(--fg)] transition-colors">{THEME_LABELS[theme]}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="glass absolute left-0 bottom-full mb-2 rounded-2xl p-2 min-w-[190px]"
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
                <ThemeChip theme={name} />
                {THEME_LABELS[name]}
                {theme === name && <span className="ml-auto text-[var(--accent)]">·</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
