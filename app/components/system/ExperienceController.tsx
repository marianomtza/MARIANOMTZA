'use client'

import React, { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { useKonamiCode } from '../../hooks/useKonamiCode'
import { useExperience } from '../../contexts/ExperienceContext'
import { audioManager } from '../../lib/audio-manager'

export function ExperienceController() {
  const [loaded, setLoaded] = useState(false)
  const { secretsUnlocked, unlockSecret } = useExperience()

  useKonamiCode(() => {
    unlockSecret()
    audioManager.play('secret')
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 } })
  })

  useEffect(() => {
    const t = window.setTimeout(() => setLoaded(true), 1200)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    const command = {
      look: 'There is a hidden zone near the footer glow.',
      unlock: 'Type the Konami code first 👀',
    }
    ;(window as Window & { marianomtza?: typeof command }).marianomtza = command
    console.info('Console Quest: window.marianomtza.look')
  }, [])

  return (
    <>
      {!loaded && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[var(--bg)]">
          <button
            className="btn btn-primary"
            onClick={async () => {
              await audioManager.unlock()
              audioManager.play('success')
              setLoaded(true)
            }}
          >
            Activar experiencia
          </button>
        </div>
      )}
      <div className="fixed left-4 bottom-4 z-[60] rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)]/80 px-3 py-2 text-xs">
        secretos: {secretsUnlocked}
      </div>
    </>
  )
}
