'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

type GameState = 'idle' | 'playing' | 'over'
type Obstacle = { id: number; x: number; w: number; h: number; variant: 'tower' | 'gate' }

const GRAVITY = 0.002
const JUMP_POWER = -0.78
const FLOOR_HEIGHT = 58
const PLAYER_SIZE = 42

export default function NotFound() {
  const [state, setState] = useState<GameState>('idle')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])

  const frameRef = useRef<number | null>(null)
  const playerYRef = useRef(0)
  const velocityRef = useRef(0)
  const obstaclesRef = useRef<Obstacle[]>([])
  const scoreRef = useRef(0)
  const spawnTimerRef = useRef(0)
  const speedRef = useRef(0.35)
  const widthRef = useRef(820)
  const playerX = 88
  const nextIdRef = useRef(1)

  useEffect(() => {
    const saved = Number(localStorage.getItem('mmtza-404-high') || 0)
    if (!Number.isNaN(saved)) setHighScore(saved)
  }, [])

  const resetGame = useCallback(() => {
    playerYRef.current = 0
    velocityRef.current = 0
    spawnTimerRef.current = 0
    speedRef.current = 0.35
    scoreRef.current = 0
    obstaclesRef.current = []
    setScore(0)
    setObstacles([])
  }, [])

  const startOrJump = useCallback(() => {
    if (state === 'idle') {
      resetGame()
      setState('playing')
      return
    }
    if (state === 'over') {
      resetGame()
      setState('playing')
      return
    }
    const onGround = playerYRef.current >= 0
    if (onGround) velocityRef.current = JUMP_POWER
  }, [resetGame, state])

  const gameOver = useCallback(() => {
    setState('over')
    const nextHigh = Math.max(highScore, scoreRef.current)
    if (nextHigh !== highScore) {
      setHighScore(nextHigh)
      localStorage.setItem('mmtza-404-high', String(nextHigh))
    }
  }, [highScore])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'KeyR'].includes(event.code)) {
        event.preventDefault()
        startOrJump()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [startOrJump])

  useEffect(() => {
    if (state !== 'playing') {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      return
    }

    let last = performance.now()

    const loop = (now: number) => {
      const dt = Math.min(now - last, 34)
      last = now

      velocityRef.current += GRAVITY * dt
      playerYRef.current = Math.min(playerYRef.current + velocityRef.current * dt, 0)
      if (playerYRef.current === 0) velocityRef.current = 0

      spawnTimerRef.current += dt
      speedRef.current = Math.min(1.1, 0.35 + scoreRef.current / 180)

      if (spawnTimerRef.current > 900 - speedRef.current * 260) {
        spawnTimerRef.current = 0
        obstaclesRef.current = [
          ...obstaclesRef.current,
          {
            id: nextIdRef.current++,
            x: widthRef.current,
            w: 24 + Math.random() * 14,
            h: 28 + Math.random() * 46,
            variant: Math.random() > 0.5 ? 'tower' : 'gate',
          },
        ]
      }

      obstaclesRef.current = obstaclesRef.current
        .map((obs) => ({ ...obs, x: obs.x - speedRef.current * dt }))
        .filter((obs) => obs.x > -80)

      const playerTop = FLOOR_HEIGHT + playerYRef.current
      const playerBottom = playerTop + PLAYER_SIZE
      const playerRight = playerX + PLAYER_SIZE

      const collision = obstaclesRef.current.some((obs) => {
        const obsLeft = obs.x
        const obsRight = obs.x + obs.w
        const obsTop = 220 - FLOOR_HEIGHT - obs.h
        const obsBottom = obsTop + obs.h

        return (
          playerRight > obsLeft + 4 &&
          playerX < obsRight - 4 &&
          playerBottom > obsTop + 6 &&
          playerTop < obsBottom - 4
        )
      })

      if (collision) {
        gameOver()
        return
      }

      scoreRef.current += dt * 0.015
      setScore(Math.floor(scoreRef.current))
      setObstacles([...obstaclesRef.current])

      frameRef.current = requestAnimationFrame(loop)
    }

    frameRef.current = requestAnimationFrame(loop)
    return () => frameRef.current !== null && cancelAnimationFrame(frameRef.current)
  }, [gameOver, state])

  const statusText = useMemo(() => {
    if (state === 'idle') return 'Space, ArrowUp o tap para empezar'
    if (state === 'over') return 'Game Over · Space / R o tap para reiniciar'
    return 'Esquiva los obstáculos'
  }, [state])

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--fg)] p-6">
      <div className="max-w-[860px] w-full">
        <p className="font-mono text-[11px] tracking-[0.28em] text-[var(--accent)] uppercase mb-4">Error 404</p>
        <h1 className="font-display text-[clamp(3rem,9vw,6rem)] leading-[0.92] mb-4">Ruta fantasma</h1>
        <p className="text-[var(--fg-muted)] mb-8">No encontramos esta dirección. Mientras vuelves, juega una carrera nocturna.</p>

        <button
          onClick={startOrJump}
          className="relative h-[220px] w-full rounded-2xl border border-[var(--line)] bg-[linear-gradient(180deg,rgba(35,26,58,0.45),rgba(9,8,13,0.95))] overflow-hidden text-left"
        >
          <div className="absolute top-4 left-5 font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--fg-muted)]">{statusText}</div>
          <div className="absolute top-4 right-5 font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--fg-muted)]">{String(score).padStart(4, '0')} · Hi {String(highScore).padStart(4, '0')}</div>

          <div className="absolute left-0 right-0 h-[3px] bg-[var(--accent)]/50" style={{ bottom: FLOOR_HEIGHT - 5 }} />
          <div className="absolute left-0 right-0 h-[55px] bottom-0 bg-[linear-gradient(180deg,rgba(25,20,34,0.8),rgba(10,8,12,1))]" />

          <div
            className={`absolute rounded-full bg-[var(--accent-soft)] transition-transform ${state === 'over' ? 'animate-pulse' : ''}`}
            style={{
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
              bottom: FLOOR_HEIGHT + playerYRef.current,
              transform: `rotate(${state === 'playing' ? Math.min(16, -velocityRef.current * 18) : 0}deg)`,
            }}
          >
            <span className="absolute left-3 top-3 w-2 h-2 rounded-full bg-[var(--bg)]" />
            <span className="absolute right-3 top-3 w-2 h-2 rounded-full bg-[var(--bg)]" />
            <span className="absolute left-1/2 -translate-x-1/2 bottom-2 w-4 h-1 rounded-full bg-[var(--bg)]" />
          </div>

          {obstacles.map((obs) => (
            <div
              key={obs.id}
              className="absolute bottom-[58px]"
              style={{ left: obs.x, width: obs.w, height: obs.h }}
            >
              <div className={`w-full h-full rounded-md border ${obs.variant === 'tower' ? 'bg-[rgba(231,213,255,0.75)] border-[rgba(240,171,252,0.6)]' : 'bg-[rgba(167,139,250,0.75)] border-[rgba(217,70,239,0.6)]'}`} />
            </div>
          ))}
        </button>

        <div className="mt-8 flex justify-between items-center gap-4 flex-wrap">
          <Link href="/" className="btn btn-ghost"><span>Volver al inicio</span><span aria-hidden>→</span></Link>
          <Link href="/inspiracion" className="btn btn-primary"><span>Ir a INSPIRACIÓN</span><span aria-hidden>↗</span></Link>
        </div>
      </div>
    </main>
  )
}
