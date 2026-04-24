'use client'

import React from 'react'
import { THEMES } from '../../lib/design-tokens'
import { useTheme } from '../../contexts/ThemeContext'
import { audioManager } from '../../lib/audio-manager'

const preview: Record<string, string> = {
  dark: '#9b5fd6',
  light: '#7f41d8',
  neon: '#00e5ff',
  minimal: '#d0c1ff',
  experimental: '#f24eb4',
}

export function ThemeSwitcher() {
  const { theme, setTheme, cycleTheme } = useTheme()

  return (
    <div className="fixed right-4 bottom-4 z-[70] rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)]/80 backdrop-blur px-3 py-2">
      <button
        onClick={() => {
          cycleTheme()
          audioManager.play('hover')
        }}
        className="text-xs uppercase tracking-[0.2em] text-[var(--fg-muted)] mb-2"
      >
        Theme: {theme}
      </button>
      <div className="flex gap-2">
        {THEMES.map((name) => (
          <button
            key={name}
            onClick={() => setTheme(name)}
            className={`h-6 w-6 rounded-full border ${name === theme ? 'border-[var(--accent)]' : 'border-[var(--line)]'}`}
            style={{ background: preview[name] }}
            aria-label={`Activar tema ${name}`}
          />
        ))}
      </div>
    </div>
  )
}
