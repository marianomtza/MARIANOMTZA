import React, { useState, useEffect, useRef } from 'react'
import { useAudio } from '../contexts/AudioContext'

const RAVE_COLORS = ['#7c3aed', '#d946ef', '#22d3ee', '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#ec4899']
const RAVE_DURATION_MS = 8000
const TOAST_DURATION_MS = 3200

export function EasterEggs() {
  const audio = useAudio()
  const [toastText, setToastText] = useState('')
  const [raveColor, setRaveColor] = useState('')
  const [raveActive, setRaveActive] = useState(false)

  const toastUntilRef = useRef(0)
  const raveStartRef = useRef(0)
  const originalAccentRef = useRef('')
  const rafRef = useRef(null)
  const typedBufferRef = useRef('')
  const konamiRef = useRef([])

  useEffect(() => {
    // Console ASCII art — reward curious devs
    console.log(
      '%c\n' +
      '  ███╗   ███╗ █████╗ ██████╗ ██╗ █████╗ ███╗   ██╗ ██████╗ \n' +
      '  ████╗ ████║██╔══██╗██╔══██╗██║██╔══██╗████╗  ██║██╔═══██╗\n' +
      '  ██╔████╔██║███████║██████╔╝██║███████║██╔██╗ ██║██║   ██║\n' +
      '  ██║╚██╔╝██║██╔══██║██╔══██╗██║██╔══██║██║╚██╗██║██║   ██║\n' +
      '  ██║ ╚═╝ ██║██║  ██║██║  ██║██║██║  ██║██║ ╚████║╚██████╔╝\n' +
      '  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝\n\n' +
      '  hola, curioso   — hola@marianomtza.com\n' +
      '  try: ↑↑↓↓←→←→ba\n',
      'color: #7c3aed; font-family: monospace; font-size: 10px;'
    )

    const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown']
    const LAFAMA_TARGET = 'LAFAMA'

    const triggerRave = () => {
      const root = document.documentElement
      if (!originalAccentRef.current) {
        originalAccentRef.current = getComputedStyle(root).getPropertyValue('--accent').trim() || '#7c3aed'
      }
      raveStartRef.current = performance.now()
      setRaveActive(true)
      audio?.click?.()
    }

    const showToast = (text) => {
      setToastText(text)
      toastUntilRef.current = performance.now() + TOAST_DURATION_MS
      audio?.click?.()
    }

    const onKey = (e) => {
      konamiRef.current.push(e.key)
      if (konamiRef.current.length > KONAMI.length) konamiRef.current.shift()
      if (konamiRef.current.join(',') === KONAMI.join(',')) {
        triggerRave()
        konamiRef.current = []
      }

      const tag = document.activeElement?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return
      if (e.key.length === 1) {
        typedBufferRef.current += e.key.toUpperCase()
        if (typedBufferRef.current.length > LAFAMA_TARGET.length) {
          typedBufferRef.current = typedBufferRef.current.slice(
            typedBufferRef.current.length - LAFAMA_TARGET.length
          )
        }
        if (typedBufferRef.current === LAFAMA_TARGET) {
          showToast('👁  LA FAMA TE VE')
          typedBufferRef.current = ''
        }
      }
    }

    const tick = (now) => {
      if (toastUntilRef.current && now >= toastUntilRef.current) {
        setToastText('')
        toastUntilRef.current = 0
      }

      if (raveStartRef.current) {
        const elapsed = now - raveStartRef.current
        if (elapsed >= RAVE_DURATION_MS) {
          document.documentElement.style.setProperty('--accent', originalAccentRef.current || '#7c3aed')
          setRaveActive(false)
          setRaveColor('')
          raveStartRef.current = 0
        } else {
          const colorIndex = Math.floor(elapsed / 220) % RAVE_COLORS.length
          const nextColor = RAVE_COLORS[colorIndex]
          document.documentElement.style.setProperty('--accent', nextColor)
          setRaveColor(nextColor)
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('keydown', onKey)
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('keydown', onKey)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
      if (originalAccentRef.current) {
        document.documentElement.style.setProperty('--accent', originalAccentRef.current)
      }
    }
  }, [])

  return (
    <>
      {toastText && (
        <div className="easter-toast in">
          {toastText}
        </div>
      )}
      {raveActive && (
        <div
          className="rave-overlay"
          style={{
            background: `radial-gradient(ellipse at center, ${raveColor}44 0%, transparent 70%)`
          }}
        />
      )}
    </>
  )
}
