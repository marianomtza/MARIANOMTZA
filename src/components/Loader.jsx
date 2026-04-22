import React, { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Loader Component - Progress animation on mount
 */
export function Loader({ onDone }) {
  const [p, setP] = useState(0)
  const [gone, setGone] = useState(false)
  const doneRef = useRef(false)

  useEffect(() => {
    let rafId = null
    const durationMs = 1500
    const start = performance.now()

    const animate = (now) => {
      const progress = Math.min(1, (now - start) / durationMs)
      setP(Math.floor(progress * 100))
      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      } else {
        setGone(true)
      }
    }

    rafId = requestAnimationFrame(animate)
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  const handleTransitionEnd = useCallback((event) => {
    if (doneRef.current) return
    if (!gone) return
    if (event.target !== event.currentTarget) return
    if (event.propertyName !== 'transform') return
    doneRef.current = true
    onDone()
  }, [gone, onDone])

  return (
    <div className={`loader ${gone ? 'done' : ''}`} style={{ '--p': p / 100 }} onTransitionEnd={handleTransitionEnd}>
      <div className="loader-top">
        <div>init</div>
        <div>marianomtza.com</div>
      </div>
      <div className="loader-center">
        <div className="loader-count">
          <span>cargando</span>
          <span className="pct">{p}</span>
        </div>
      </div>
      <div className="loader-bottom">
        <span></span>
        <div className="loader-bar"></div>
      </div>
    </div>
  )
}
