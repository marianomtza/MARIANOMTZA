'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { THEMES, ThemeName, themeTokens } from '../lib/design-tokens'

const STORAGE_KEY = 'mmtza-theme-v2'
const DEFAULT_THEME: ThemeName = 'dark'

interface ThemeContextValue {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  cycleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function applyTheme(theme: ThemeName) {
  const root = document.documentElement
  root.dataset.theme = theme
  const tokens = themeTokens[theme]
  for (const key in tokens) {
    root.style.setProperty(key, tokens[key])
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(DEFAULT_THEME)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeName | null
    const initial = stored && (THEMES as string[]).includes(stored) ? stored : DEFAULT_THEME
    setThemeState(initial)
    applyTheme(initial)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    applyTheme(theme)
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme, mounted])

  const setTheme = (nextTheme: ThemeName) => setThemeState(nextTheme)

  const cycleTheme = () => {
    const index = THEMES.indexOf(theme)
    setThemeState(THEMES[(index + 1) % THEMES.length])
  }

  const value = useMemo(() => ({ theme, setTheme, cycleTheme }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
