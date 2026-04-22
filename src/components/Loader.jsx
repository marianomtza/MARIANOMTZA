import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useMotionFrame } from '../contexts/MotionContext'

/**
 * Loader Component - Progress animation on mount
 */
export function Loader({ onDone }) {
  const [p, setP] = useState(0)
  const [gone, setGone] = useState(false)
  const doneRef = useRef(false)
  const startedAtRef = useRef(0)
  const finishedRef = useRef(false)

  useEffect(() => {
    startedAtRef.current = performance.now()
    finishedRef.current = false
  }, [])

  useMotionFrame(({ now }) => {
    if (finishedRef.current) return
    const durationMs = 1500
    const progress = Math.min(1, (now - startedAtRef.current) / durationMs)
    setP(Math.floor(progress * 100))
    if (progress >= 1) {
      finishedRef.current = true
      setGone(true)
    }
  })

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
