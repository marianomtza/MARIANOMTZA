import React, { useState, useEffect } from 'react'
import { useInterval } from '../hooks/useAnimations'

/**
 * Loader Component - Progress animation on mount
 */
export function Loader({ onDone }) {
  const [p, setP] = useState(0)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    let cur = 0
    const tick = () => {
      cur = Math.min(100, cur + Math.random() * 18 + 4)
      setP(Math.floor(cur))
      if (cur >= 100) {
        setTimeout(() => setGone(true), 400)
        setTimeout(() => onDone(), 1400)
      }
    }

    const interval = setInterval(tick, 140)
    return () => clearInterval(interval)
  }, [onDone])

  return (
    <div className={`loader ${gone ? 'done' : ''}`} style={{ '--p': p / 100 }}>
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
