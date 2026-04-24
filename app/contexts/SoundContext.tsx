'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'mmtza-sound-enabled'

interface SoundContextValue {
  enabled: boolean
  toggle: () => void
  setEnabled: (value: boolean) => void
}

const SoundContext = createContext<SoundContextValue | undefined>(undefined)

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === 'true') setEnabledState(true)
    } catch {
      /* swallow */
    }
  }, [])

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value)
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false')
    } catch {
      /* swallow */
    }
  }, [])

  const toggle = useCallback(() => setEnabled(!enabled), [enabled, setEnabled])

  const value = useMemo(() => ({ enabled, toggle, setEnabled }), [enabled, toggle, setEnabled])

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSound() {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound must be used within SoundProvider')
  return ctx
}
