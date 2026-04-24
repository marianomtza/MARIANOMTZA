'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export default function NotFound() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [jump, setJump] = useState(false)
  const obstacleRef = useRef(100)

  useEffect(() => {
    if (!isPlaying) return
    let frame = 0

    const loop = () => {
      obstacleRef.current -= 1.6
      if (obstacleRef.current < -10) {
        obstacleRef.current = 100
        setScore((prev) => prev + 1)
      }

      if (!jump && obstacleRef.current < 20 && obstacleRef.current > 10) {
        setIsPlaying(false)
      }

      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [isPlaying, jump])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setJump(true)
        setTimeout(() => setJump(false), 420)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <main className="min-h-screen grid place-items-center bg-[var(--bg)] text-[var(--fg)] p-6">
      <section className="w-full max-w-2xl rounded-3xl border border-[var(--line)] bg-[var(--bg-elevated)] p-8">
        <h1 className="font-display text-4xl mb-2">404 • Route Lost</h1>
        <p className="text-[var(--fg-muted)] mb-8">Mini-juego offline: salta con barra espaciadora para esquivar obstáculos.</p>

        <div className="relative h-44 rounded-xl border border-[var(--line)] overflow-hidden bg-black/20 mb-5">
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--line)]" />
          <div className={`absolute left-10 h-8 w-8 bg-[var(--accent)] rounded-sm transition-transform ${jump ? '-translate-y-20' : 'translate-y-0'}`} style={{ bottom: '2px' }} />
          <div className="absolute bottom-[2px] h-8 w-4 bg-[var(--accent-soft)]" style={{ left: `${obstacleRef.current}%` }} />
        </div>

        <div className="flex items-center gap-4 mb-6">
          <button className="btn btn-primary" onClick={() => { setScore(0); obstacleRef.current = 100; setIsPlaying(true) }}>
            {isPlaying ? 'Jugando…' : 'Iniciar'}
          </button>
          <span className="text-sm">Score: {score}</span>
        </div>

        <Link href="/" className="text-sm underline underline-offset-4">Volver al inicio</Link>
      </section>
    </main>
  )
}
