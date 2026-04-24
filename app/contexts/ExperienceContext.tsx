'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'

interface ExperienceContextValue {
  secretsUnlocked: number
  unlockSecret: () => void
}

const ExperienceContext = createContext<ExperienceContextValue | undefined>(undefined)

export function ExperienceProvider({ children }: { children: React.ReactNode }) {
  const [secretsUnlocked, setSecretsUnlocked] = useState(0)

  const unlockSecret = () => {
    setSecretsUnlocked((count) => count + 1)
  }

  const value = useMemo(() => ({ secretsUnlocked, unlockSecret }), [secretsUnlocked])

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>
}

export function useExperience() {
  const context = useContext(ExperienceContext)
  if (!context) throw new Error('useExperience must be used inside ExperienceProvider')
  return context
}
