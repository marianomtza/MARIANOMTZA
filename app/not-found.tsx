'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const W = 860
const H = 260
const GROUND_Y = 214

type Obstacle = { x: number; w: number; h: number; speed: number; flying: boolean }

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)

  const [phase, setPhase] = useState<'idle' | 'play' | 'over'>('idle')
  const [score, setScore] = useState(0)
  const [high, setHigh] = useState(0)

  const playerY = useRef(GROUND_Y)
  const velY = useRef(0)
  const obstacles = useRef<Obstacle[]>([])
  const scoreTick = useRef(0)

  useEffect(() => setHigh(Number(localStorage.getItem('mmtza-404-hi') || 0)), [])

  const reset = useCallback(() => {
    playerY.current = GROUND_Y
    velY.current = 0
    obstacles.current = []
    scoreTick.current = 0
    setScore(0)
  }, [])

  const jump = useCallback(() => {
    if (phase === 'idle') return setPhase('play')
    if (phase === 'over') {
      reset()
      return setPhase('play')
    }
    if (playerY.current >= GROUND_Y - 1) velY.current = -11.2
  }, [phase, reset])

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        jump()
      }
      if (phase === 'over' && e.key.toLowerCase() === 'r') jump()
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [phase, jump])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || phase !== 'play') return

    let last = performance.now()
    let spawn = 0

    const renderStick = (x: number, y: number) => {
      ctx.strokeStyle = '#f4f2ff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y - 26, 10, 0, Math.PI * 2)
      ctx.moveTo(x, y - 16); ctx.lineTo(x, y + 10)
      ctx.moveTo(x, y - 2); ctx.lineTo(x - 14, y + 6)
      ctx.moveTo(x, y - 2); ctx.lineTo(x + 14, y + 6)
      ctx.moveTo(x, y + 10); ctx.lineTo(x - 12, y + 24)
      ctx.moveTo(x, y + 10); ctx.lineTo(x + 12, y + 24)
      ctx.stroke()
    }

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 2)
      last = now

      velY.current += 0.62 * dt
      playerY.current = Math.min(GROUND_Y, playerY.current + velY.current * dt)
      if (playerY.current >= GROUND_Y) velY.current = 0

      spawn += dt
      const difficulty = Math.min(1.8, 1 + score / 120)
      if (spawn > Math.max(30, 76 - score / 4)) {
        spawn = 0
        obstacles.current.push({
          x: W + 20,
          w: 14 + Math.random() * 18,
          h: 22 + Math.random() * 40,
          speed: 4.2 + Math.random() * 1.8,
          flying: Math.random() < 0.28 && score > 30,
        })
      }

      obstacles.current.forEach((o) => (o.x -= o.speed * difficulty * dt))
      obstacles.current = obstacles.current.filter((o) => o.x > -80)

      // collision
      const p = { l: 96, r: 128, t: playerY.current - 38, b: playerY.current + 24 }
      let hit = false
      for (const o of obstacles.current) {
        const oy = o.flying ? GROUND_Y - 70 : GROUND_Y + 26 - o.h
        const overlap = p.r > o.x + 2 && p.l < o.x + o.w - 2 && p.b > oy + 2 && p.t < oy + o.h - 2
        if (overlap) hit = true
      }

      // draw
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#110a1f'
      ctx.fillRect(0, 0, W, H)
      ctx.strokeStyle = 'rgba(255,255,255,.25)'
      ctx.beginPath(); ctx.moveTo(0, GROUND_Y + 26); ctx.lineTo(W, GROUND_Y + 26); ctx.stroke()

      ctx.fillStyle = '#f4f2ff'
      for (const o of obstacles.current) {
        const oy = o.flying ? GROUND_Y - 70 : GROUND_Y + 26 - o.h
        ctx.fillRect(o.x, oy, o.w, o.h)
      }

      renderStick(112, playerY.current)

      scoreTick.current += dt
      if (scoreTick.current > 4) {
        scoreTick.current = 0
        setScore((s) => s + 1)
      }

      if (hit) {
        setPhase('over')
        setHigh((h) => {
          const next = Math.max(h, score)
          localStorage.setItem('mmtza-404-hi', String(next))
          return next
        })
        return
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase, score])

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--fg)] p-6">
      <div className="max-w-[760px] w-full">
        <div className="font-mono text-[11px] tracking-[0.28em] text-[var(--accent)] mb-4 uppercase">Error 404</div>
        <h1 className="font-display text-[clamp(3rem,9vw,6rem)] leading-[0.92] mb-5">Señal perdida.</h1>
        <p className="font-editorial text-lg text-[var(--fg-muted)] max-w-[42ch] mb-6">Salta obstáculos, sube el score y reinicia con R. También funciona en touch.</p>

        <div className="relative rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] overflow-hidden" onClick={jump} role="button" tabIndex={0}>
          <canvas ref={canvasRef} width={W} height={H} className="w-full h-auto block" />
          <div className="absolute top-3 right-4 font-mono text-xs">{String(score).padStart(4, '0')} · HI {String(high).padStart(4, '0')}</div>
          {(phase === 'idle' || phase === 'over') && (
            <div className="absolute inset-0 flex items-center justify-center font-mono text-xs tracking-[0.22em] uppercase text-center px-4">
              {phase === 'idle' ? 'Space / Tap para iniciar' : 'Game Over · Space/Tap o R para reiniciar'}
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center gap-4">
          <Link href="/" className="btn btn-primary">Volver al home</Link>
          <button className="btn btn-ghost" onClick={jump}>Reintentar</button>
        </div>
      </div>
    </main>
  )
}
