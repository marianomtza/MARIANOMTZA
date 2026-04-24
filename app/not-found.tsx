'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const GROUND = 140
const GRAVITY = 0.64
const JUMP = -11

type Obstacle = { id: number; x: number; y: number; w: number; h: number; speed: number }

export default function NotFound() {
  const [phase, setPhase] = useState<'idle' | 'play' | 'over'>('idle')
  const [score, setScore] = useState(0)
  const [high, setHigh] = useState(0)

  const y = useRef(GROUND)
  const vy = useRef(0)
  const obstacles = useRef<Obstacle[]>([])
  const idRef = useRef(0)
  const frame = useRef(0)
  const player = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLDivElement>(null)

  useEffect(() => setHigh(Number(localStorage.getItem('mmtza-404-high') || 0)), [])

  const reset = useCallback(() => {
    y.current = GROUND
    vy.current = 0
    obstacles.current = []
    setScore(0)
  }, [])

  const trigger = useCallback(() => {
    if (phase === 'idle') return setPhase('play')
    if (phase === 'over') {
      reset()
      return setPhase('play')
    }
    if (y.current >= GROUND - 1) vy.current = JUMP
  }, [phase, reset])

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        trigger()
      }
      if (phase === 'over' && e.key.toLowerCase() === 'r') trigger()
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [phase, trigger])

  useEffect(() => {
    if (phase !== 'play') return
    let last = performance.now()
    let spawn = 0
    let baseSpeed = 4
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 16.6, 2)
      last = now
      vy.current += GRAVITY * dt
      y.current = Math.min(GROUND, y.current + vy.current * dt)
      if (y.current >= GROUND) vy.current = 0
      if (player.current) player.current.style.transform = `translate3d(0,${y.current}px,0)`

      spawn += dt
      if (spawn > Math.max(35, 78 - score * 0.2)) {
        spawn = 0
        const h = 24 + Math.random() * 42
        const flying = Math.random() < 0.3 && score > 25
        obstacles.current.push({ id: ++idRef.current, x: 860, y: flying ? GROUND - 54 - Math.random() * 35 : GROUND + 40 - h, w: 16 + Math.random() * 16, h, speed: baseSpeed + Math.random() * 1.8 })
      }

      baseSpeed = Math.min(9.5, 4 + score / 18)
      obstacles.current.forEach((o) => (o.x -= (o.speed + baseSpeed) * dt))
      obstacles.current = obstacles.current.filter((o) => o.x > -80)

      const p = { l: 90, r: 130, t: y.current + 6, b: y.current + 44 }
      let hit = false
      for (const o of obstacles.current) {
        const overlap = p.r > o.x + 2 && p.l < o.x + o.w - 2 && p.b > o.y + 3 && p.t < o.y + o.h - 3
        if (overlap) hit = true
      }

      if (list.current) {
        list.current.innerHTML = obstacles.current.map((o) => `<div style="position:absolute;left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;border-radius:3px;background:var(--fg)"></div>`).join('')
      }

      if (Math.random() < 0.12) setScore((s) => s + 1)

      if (hit) {
        setPhase('over')
        setHigh((h) => {
          const next = Math.max(h, score)
          localStorage.setItem('mmtza-404-high', String(next))
          return next
        })
        return
      }
      frame.current = requestAnimationFrame(loop)
    }

    frame.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame.current)
  }, [phase, score])

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--fg)] p-6">
      <div className="max-w-[760px] w-full">
        <div className="font-mono text-[11px] tracking-[0.28em] text-[var(--accent)] mb-4 uppercase">Error 404</div>
        <h1 className="font-display text-[clamp(3rem,9vw,6rem)] leading-[0.92] mb-5">Señal perdida.</h1>
        <p className="font-editorial text-lg text-[var(--fg-muted)] max-w-[42ch] mb-6">Ahora sí hay obstáculos reales: algunos vuelan, la velocidad sube y puedes reiniciar con R.</p>
        <div onClick={trigger} className="relative h-[260px] rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] overflow-hidden cursor-pointer" role="button" tabIndex={0}>
          <div className="absolute left-0 right-0 h-px bg-[var(--line-strong)]" style={{ top: GROUND + 42 }} />
          <div className="absolute top-3 right-4 font-mono text-xs">{String(score).padStart(4, '0')} · HI {String(high).padStart(4, '0')}</div>
          {(phase === 'idle' || phase === 'over') && <div className="absolute inset-0 flex items-center justify-center font-mono text-xs tracking-[0.22em] uppercase">{phase === 'idle' ? 'Space para iniciar' : 'Game Over · Space/R para reiniciar'}</div>}
          <div ref={player} className="absolute left-[90px] h-[44px] w-[40px]" style={{ top: GROUND }}>
            <div className="absolute inset-0 border-2 border-[var(--fg)] rounded-full" />
            <div className="absolute left-1/2 top-2 h-8 w-[2px] bg-[var(--fg)] -translate-x-1/2" />
            <div className="absolute left-1/2 top-4 h-[2px] w-6 bg-[var(--fg)] -translate-x-1/2" />
          </div>
          <div ref={list} className="absolute inset-0" />
        </div>
        <div className="mt-8 flex items-center gap-4">
          <Link href="/" className="btn btn-primary">Volver al home</Link>
          <button className="btn btn-ghost" onClick={trigger}>Reintentar</button>
        </div>
      </div>
    </main>
  )
}
