import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

// Theme presets: each has accent + soft + deep variants
const THEME_PRESETS = {
  violet: {
    name: 'Violet',
    accent: '#9b5fd6',
    accentSoft: '#6b3fa8',
    accentDeep: '#3d1d6e',
  },
  magenta: {
    name: 'Magenta',
    accent: '#d65f9b',
    accentSoft: '#a83f6b',
    accentDeep: '#6e1d3d',
  },
  cyan: {
    name: 'Cyan',
    accent: '#5fc7d6',
    accentSoft: '#3f95a8',
    accentDeep: '#1d516e',
  },
  amber: {
    name: 'Amber',
    accent: '#d6a35f',
    accentSoft: '#a8793f',
    accentDeep: '#6e4a1d',
  },
  lime: {
    name: 'Lime',
    accent: '#9bd65f',
    accentSoft: '#6ba83f',
    accentDeep: '#3d6e1d',
  },
}

function parseStoredBoolean(key, fallback) {
  if (typeof window === 'undefined') return fallback
  const saved = localStorage.getItem(key)
  if (saved === null) return fallback
  try {
    return JSON.parse(saved)
  } catch (_error) {
    return fallback
  }
}

/**
 * ThemeProvider - Manage theme colors and animations
 * Persists to localStorage
 */
export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(() => {
    // Load from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'violet'
    }
    return 'violet'
  })

  const [motionEnabled, setMotionEnabled] = useState(() => {
    return parseStoredBoolean('motionEnabled', true)
  })

  const [starsVisible, setStarsVisible] = useState(() => {
    return parseStoredBoolean('starsVisible', true)
  })

  const [grainVisible, setGrainVisible] = useState(() => {
    return parseStoredBoolean('grainVisible', true)
  })

  const currentTheme = THEME_PRESETS[themeKey] || THEME_PRESETS.violet

  // Update CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--accent', currentTheme.accent)
    root.style.setProperty('--accent-soft', currentTheme.accentSoft)
    root.style.setProperty('--accent-deep', currentTheme.accentDeep)
    localStorage.setItem('theme', themeKey)
  }, [themeKey, currentTheme])

  // Persist other settings
  useEffect(() => {
    localStorage.setItem('motionEnabled', JSON.stringify(motionEnabled))
    document.body.classList.toggle('no-motion', !motionEnabled)
  }, [motionEnabled])

  useEffect(() => {
    localStorage.setItem('starsVisible', JSON.stringify(starsVisible))
  }, [starsVisible])

  useEffect(() => {
    localStorage.setItem('grainVisible', JSON.stringify(grainVisible))
  }, [grainVisible])

  const value = {
    themeKey,
    setThemeKey,
    currentTheme,
    presets: THEME_PRESETS,
    motionEnabled,
    setMotionEnabled,
    starsVisible,
    setStarsVisible,
    grainVisible,
    setGrainVisible,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * useTheme - Hook to access theme settings
 */
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}
