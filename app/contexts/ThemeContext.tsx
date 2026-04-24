'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { THEMES, ThemeName, themeTokens } from '../lib/design-tokens'

const STORAGE_KEY = 'mmtza-theme'

interface ThemeContextValue {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  cycleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('dark')

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeName | null
    if (stored && THEMES.includes(stored)) {
      setThemeState(stored)
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    Object.entries(themeTokens[theme]).forEach(([token, value]) => {
      document.documentElement.style.setProperty(token, value)
    })
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

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
