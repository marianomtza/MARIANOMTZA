import React, { useRef, useEffect } from 'react'
import { useAnimationFrame, useEventListener } from '../hooks/useAnimations'
import { useTheme } from '../contexts/ThemeContext'

/**
 * PremiumCursor Component - Smooth cursor with context-aware states
 * Features: Zero memory leaks, RAF cleanup, refined easing, theme-aware
 */
export function PremiumCursor() {
  const dotRef = useRef(null)
  const state = useRef({ x: 0, y: 0, tx: 0, ty: 0, scale: 1, tScale: 1 })
  const lastHoverStateRef = useRef('')
  const theme = useTheme()

  // Handle mouse move
  const handleMouseMove = (e) => {
    state.current.x = e.clientX
    state.current.y = e.clientY
  }

  // Detect interactive elements and update cursor state
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

  // RAF loop for smooth cursor tracking
  useAnimationFrame(() => {
    if (!dotRef.current) return
    const s = state.current
    // Reduced friction (0.15) for snappy response
    s.tx += (s.x - s.tx) * 0.15
    s.ty += (s.y - s.ty) * 0.15
    s.scale += (s.tScale - s.scale) * 0.18

    dotRef.current.style.left = s.tx + 'px'
    dotRef.current.style.top = s.ty + 'px'
    dotRef.current.style.transform = `translate(-50%, -50%) scale(${s.scale})`
  })

  useEventListener('mousemove', handleMouseMove, document)
  useEventListener('mouseover', handleElementChange, document)

  // Hide on pointer: coarse (mobile)
  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches
    if (isMobile && dotRef.current) {
      dotRef.current.style.display = 'none'
    }
  }, [])

  return (
    <div
      ref={dotRef}
      className="cursor-premium cursor-default"
      style={{
        position: 'fixed',
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: theme.currentTheme.accent,
        pointerEvents: 'none',
        zIndex: 9999,
        willChange: 'transform',
      }}
    />
  )
}
