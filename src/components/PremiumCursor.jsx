import React, { useRef, useEffect } from 'react'
import { useMotion, useMotionFrame } from '../contexts/MotionContext'
import { useTheme } from '../contexts/ThemeContext'

/**
 * PremiumCursor Component - Smooth cursor with context-aware states
 * Features: Zero memory leaks, RAF cleanup, refined easing, theme-aware
 */
export function PremiumCursor() {
  const dotRef = useRef(null)
  const trailRef = useRef(null)
  const state = useRef({ tx: 0, ty: 0, scale: 1, tScale: 1, trailX: 0, trailY: 0 })
  const lastHoverStateRef = useRef('')
  const theme = useTheme()
  const { pointerRef } = useMotion()

  const handleElementChange = (e) => {
    if (!dotRef.current) return

    const t = e.target
    const interactive = t.closest('a, button, .roster-card, .event-row, .tweak-colors button')
    const textish = t.closest('input, textarea, p, h1, h2, h3, h4, .char')

    let nextState = 'default'
    if (interactive) {
      nextState = 'interactive'
      state.current.tScale = 1.4
    } else if (textish) {
      nextState = 'text'
      state.current.tScale = 0.6
    } else {
      nextState = 'default'
      state.current.tScale = 1
    }

    if (nextState !== lastHoverStateRef.current) {
      lastHoverStateRef.current = nextState
      dotRef.current.className = `cursor-premium cursor-${nextState}`
    }
  }

  useMotionFrame(() => {
    if (!dotRef.current || !trailRef.current) return
    const s = state.current
    const pointer = pointerRef.current
    s.tx += (pointer.x - s.tx) * 0.25
    s.ty += (pointer.y - s.ty) * 0.25
    s.scale += (s.tScale - s.scale) * 0.2
    s.trailX += (pointer.x - s.trailX) * 0.15
    s.trailY += (pointer.y - s.trailY) * 0.15

    dotRef.current.style.transform = `translate3d(${s.tx}px, ${s.ty}px, 0) translate(-50%, -50%) scale(${s.scale})`
    trailRef.current.style.transform = `translate3d(${s.trailX}px, ${s.trailY}px, 0) translate(-50%, -50%)`
  })

  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches
    if (isMobile && dotRef.current) {
      dotRef.current.style.display = 'none'
      trailRef.current.style.display = 'none'
    }
    document.addEventListener('mouseover', handleElementChange)
    return () => {
      document.removeEventListener('mouseover', handleElementChange)
    }
  }, [])

  return (
    <>
      <div
        ref={trailRef}
        className="cursor-trail-premium"
        style={{
          borderColor: theme.currentTheme.accent,
        }}
      />
      <div
        ref={dotRef}
        className="cursor-premium cursor-default"
        style={{
          background: theme.currentTheme.accent,
        }}
      />
    </>
  )
}
