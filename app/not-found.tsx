'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

/**
 * 404 — "Señal perdida"
 * Chrome offline dino vibe but editorial: monochrome, serif, on-brand.
 * Mechanic: jump with Space / click to dodge barrels.
 */

const GROUND_Y = 112
const JUMP_VELOCITY = -9.5
const GRAVITY = 0.55
const OBSTACLE_SPEED_BASE = 4.2
const OBSTACLE_MIN_GAP = 260
const OBSTACLE_MAX_GAP = 460

type Obstacle = { id: number; x: number; w: number; h: number }

export default function NotFound() {
  const [state, setState] = useState<'idle' | 'playing' | 'over'>('idle')
  const [score, setScore] = useState(0)
  const [high, setHigh] = useState(0)

  const playerY = useRef(GROUND_Y)
  const vy = useRef(0)
  const obstacles = useRef<Obstacle[]>([])
  const nextId = useRef(1)
  const frameRef = useRef<number>(0)
  const speedRef = useRef(OBSTACLE_SPEED_BASE)
  const stateRef = useRef(state)
  stateRef.current = state

  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const obstaclesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = Number(localStorage.getItem('mmtza-404-high') ?? 0)
    if (!Number.isNaN(stored)) setHigh(stored)
  }, [])

  const reset = useCallback(() => {
    playerY.current = GROUND_Y
    vy.current = 0
    obstacles.current = []
    speedRef.current = OBSTACLE_SPEED_BASE
    nextId.current = 1
    setScore(0)
  }, [])

  const jump = useCallback(() => {
    if (stateRef.current === 'idle') {
      setState('playing')
      return
    }
    if (stateRef.current === 'over') {
      reset()
      setState('playing')
      return
    }
    if (playerY.current >= GROUND_Y - 1) {
      vy.current = JUMP_VELOCITY
    }
  }, [reset])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        jump()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [jump])

  useEffect(() => {
    if (state !== 'playing') return
    let last = performance.now()
    let sinceSpawn = 0
    let nextGap = OBSTACLE_MIN_GAP + Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP)
    let tickScore = 0

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 16.666, 2)
      last = now

      // Physics
      vy.current += GRAVITY * dt
      playerY.current = Math.min(playerY.current + vy.current * dt, GROUND_Y)
      if (playerY.current >= GROUND_Y) {
        playerY.current = GROUND_Y
        vy.current = 0
      }
      if (playerRef.current) {
        playerRef.current.style.transform = `translate3d(0, ${playerY.current}px, 0)`
      }

      // Spawn
      sinceSpawn += speedRef.current * dt
      if (sinceSpawn >= nextGap) {
        sinceSpawn = 0
        nextGap = OBSTACLE_MIN_GAP + Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP)
        const h = 24 + Math.random() * 28
        obstacles.current.push({
          id: nextId.current++,
          x: 840,
          w: 14 + Math.random() * 10,
          h,
        })
      }

      // Move obstacles
      obstacles.current.forEach((o) => {
        o.x -= speedRef.current * dt
      })
      obstacles.current = obstacles.current.filter((o) => o.x > -60)

      // Collision (player is at x=90, width 42, height ~42 at bottom)
      const playerLeft = 88
      const playerRight = 88 + 42
      const playerTop = GROUND_Y - 40 + (playerY.current - GROUND_Y)
      const playerBottom = playerTop + 44

      let hit = false
      for (const o of obstacles.current) {
        const oLeft = o.x
        const oRight = o.x + o.w
        const oTop = GROUND_Y - o.h + 40
        const oBottom = oTop + o.h
        const overlap =
          playerRight > oLeft + 6 &&
          playerLeft < oRight - 6 &&
          playerBottom > oTop + 4 &&
          playerTop < oBottom - 4
        if (overlap) {
          hit = true
          break
        }
      }

      // Render obstacles via direct DOM (avoid re-render)
      if (obstaclesContainerRef.current) {
        obstaclesContainerRef.current.innerHTML = obstacles.current
          .map(
            (o) =>
              `<div style="position:absolute;bottom:0;left:${o.x}px;width:${o.w}px;height:${o.h}px;background:var(--fg);border-radius:2px;"></div>`
          )
          .join('')
      }

      // Score
      tickScore += dt
      if (tickScore >= 6) {
        tickScore = 0
        setScore((s) => s + 1)
        speedRef.current = Math.min(OBSTACLE_SPEED_BASE + (score + 1) / 20, 9)
      }

      if (hit) {
        setState('over')
        setScore((s) => {
          setHigh((h) => {
            const next = Math.max(h, s)
            localStorage.setItem('mmtza-404-high', String(next))
            return next
          })
          return s
        })
        return
      }

      frameRef.current = requestAnimationFrame(loop)
    }

    frameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameRef.current)
  }, [state, score])

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--fg)] p-6">
      <div className="max-w-[720px] w-full">
        <div className="font-mono text-[11px] tracking-[0.28em] text-[var(--accent)] mb-4 uppercase">
          Error 404
        </div>
        <h1 className="font-display text-[clamp(3rem,9vw,6rem)] leading-[0.92] tracking-[-0.02em] text-[var(--fg)] mb-5">
          Señal perdida.
        </h1>
        <p className="font-editorial text-lg text-[var(--fg-muted)] max-w-[42ch] mb-10">
          Ruta inexistente. Mientras encuentras el camino, salta los obstáculos con la barra
          espaciadora.
        </p>

        <div
          ref={containerRef}
          onClick={jump}
          className="relative h-[220px] w-full rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] overflow-hidden cursor-pointer select-none"
          role="button"
          tabIndex={0}
        >
          {/* Ground line */}
          <div
            className="absolute left-0 right-0 h-px bg-[var(--line-strong)]"
            style={{ bottom: 40 }}
          />

          {/* Score */}
          <div className="absolute top-4 right-5 font-mono text-[11px] tracking-[0.22em] text-[var(--fg-muted)] uppercase tabular-nums">
            <span className="text-[var(--fg)]">{String(score).padStart(4, '0')}</span>
            <span className="mx-2 opacity-30">·</span>
            <span>Hi {String(high).padStart(4, '0')}</span>
          </div>

          {/* Status */}
          {state === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="font-display text-3xl text-[var(--fg)] mb-1">Presiona</div>
                <div className="font-mono text-[11px] tracking-[0.28em] text-[var(--fg-muted)] uppercase">
                  Espacio para empezar
                </div>
              </div>
            </div>
          )}
          {state === 'over' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="font-display text-3xl text-[var(--fg)] mb-1">Game over</div>
                <div className="font-mono text-[11px] tracking-[0.28em] text-[var(--fg-muted)] uppercase">
                  Espacio para repetir
                </div>
              </div>
            </div>
          )}

          {/* Player */}
          <div
            ref={playerRef}
            className="absolute left-[88px] w-[42px] h-[42px] bg-[var(--accent)] rounded-[3px] will-change-transform"
            style={{ top: 0, transform: `translate3d(0, ${GROUND_Y}px, 0)` }}
          >
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--bg)]" />
          </div>

          {/* Obstacles */}
          <div ref={obstaclesContainerRef} className="absolute inset-0 pointer-events-none" />
        </div>

        <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
          <Link
            href="/"
            className="btn btn-ghost"
          >
            <span>Volver al inicio</span>
            <span aria-hidden>→</span>
          </Link>
          <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--fg-muted)] uppercase">
            Tip · Click o espacio
          </div>
        </div>
      </div>
    </main>
  )
}
