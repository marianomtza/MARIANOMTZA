'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Obstacle = { x: number; w: number; h: number; scored: boolean }

const WIDTH = 920
const HEIGHT = 260
const GROUND_Y = 210
const PLAYER_X = 112
const PLAYER_W = 34
const PLAYER_H = 58

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const statusRef = useRef<'idle' | 'playing' | 'over'>('idle')
  const touchDownRef = useRef(false)

  const playerY = useRef(0)
  const vy = useRef(0)
  const speed = useRef(5.2)
  const spawnIn = useRef(120)
  const obstacles = useRef<Obstacle[]>([])

  const [state, setState] = useState<'idle' | 'playing' | 'over'>('idle')
  const [score, setScore] = useState(0)
  const [hi, setHi] = useState(0)

  useEffect(() => {
    statusRef.current = state
  }, [state])

  useEffect(() => {
    const v = Number(localStorage.getItem('mmtza-404-high') ?? 0)
    if (!Number.isNaN(v)) setHi(v)
  }, [])

  const reset = useCallback(() => {
    playerY.current = 0
    vy.current = 0
    speed.current = 5.2
    spawnIn.current = 100
    obstacles.current = []
    setScore(0)
  }, [])

  const jump = useCallback(() => {
    if (statusRef.current === 'idle') {
      reset()
      setState('playing')
      return
    }
    if (statusRef.current === 'over') {
      reset()
      setState('playing')
      return
    }
    if (playerY.current <= 0.5) vy.current = 11.8
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
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor((rect.width * HEIGHT / WIDTH) * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const drawStick = (x: number, baseY: number) => {
      const y = baseY - playerY.current
      ctx.strokeStyle = 'var(--fg)'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'

      ctx.beginPath()
      ctx.arc(x + 17, y - 42, 9, 0, Math.PI * 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(x + 17, y - 33)
      ctx.lineTo(x + 17, y - 15)
      ctx.moveTo(x + 17, y - 28)
      ctx.lineTo(x + 5, y - 22)
      ctx.moveTo(x + 17, y - 28)
      ctx.lineTo(x + 29, y - 22)
      ctx.moveTo(x + 17, y - 15)
      ctx.lineTo(x + 8, y)
      ctx.moveTo(x + 17, y - 15)
      ctx.lineTo(x + 28, y)
      ctx.stroke()
    }

    const loop = () => {
      rafRef.current = 0

      const w = canvas.clientWidth
      const h = canvas.clientHeight
      const sx = w / WIDTH
      const sy = h / HEIGHT
      const ground = GROUND_Y * sy

      if (statusRef.current === 'playing') {
        vy.current -= 0.62
        playerY.current = Math.max(0, playerY.current + vy.current)
        if (playerY.current <= 0) {
          playerY.current = 0
          vy.current = 0
        }

        spawnIn.current -= speed.current
        if (spawnIn.current <= 0) {
          spawnIn.current = 110 + Math.random() * 120
          obstacles.current.push({ x: WIDTH + 40, w: 24 + Math.random() * 20, h: 28 + Math.random() * 32, scored: false })
        }

        obstacles.current.forEach((o) => { o.x -= speed.current })
        obstacles.current = obstacles.current.filter((o) => o.x + o.w > -20)

        for (const o of obstacles.current) {
          if (!o.scored && o.x + o.w < PLAYER_X) {
            o.scored = true
            setScore((s) => s + 1)
            speed.current = Math.min(11, speed.current + 0.08)
          }
        }

        const playerTop = GROUND_Y - PLAYER_H - playerY.current
        const playerBottom = GROUND_Y - playerY.current
        for (const o of obstacles.current) {
          const oTop = GROUND_Y - o.h
          const hit = PLAYER_X + PLAYER_W > o.x + 3 && PLAYER_X < o.x + o.w - 3 && playerBottom > oTop + 4 && playerTop < GROUND_Y - 2
          if (hit) {
            setState('over')
            setHi((prev) => {
              const next = Math.max(prev, score)
              localStorage.setItem('mmtza-404-high', String(next))
              return next
            })
            break
          }
        }
      }

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#08090f'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(255,255,255,0.22)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, ground)
      ctx.lineTo(w, ground)
      ctx.stroke()

      // skyline accents
      ctx.strokeStyle = 'rgba(139,92,246,0.25)'
      for (let i = 0; i < 9; i++) {
        const x = (i * 130 - (score * 5) % 130) * sx
        ctx.beginPath()
        ctx.moveTo(x, ground)
        ctx.lineTo(x, ground - (28 + (i % 3) * 15) * sy)
        ctx.stroke()
      }

      obstacles.current.forEach((o) => {
        ctx.fillStyle = '#8b5cf6'
        ctx.fillRect(o.x * sx, (GROUND_Y - o.h) * sy, o.w * sx, o.h * sy)
      })

      drawStick(PLAYER_X * sx, ground)

      rafRef.current = requestAnimationFrame(loop)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      ro.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [jump, reset, score])

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--fg)] p-6">
      <div className="max-w-[860px] w-full">
        <div className="font-mono text-[11px] tracking-[0.28em] text-[var(--accent)] mb-4 uppercase">Error 404</div>
        <h1 className="font-display text-[clamp(3rem,9vw,6rem)] leading-[0.92] mb-4">Señal perdida.</h1>
        <p className="font-editorial text-lg text-[var(--fg-muted)] mb-8">Salta obstáculos con espacio, flecha arriba o toque táctil.</p>

        <div
          className="surface p-3"
          onClick={jump}
          onTouchStart={() => {
            if (!touchDownRef.current) jump()
            touchDownRef.current = true
          }}
          onTouchEnd={() => { touchDownRef.current = false }}
          role="button"
          tabIndex={0}
        >
          <canvas ref={canvasRef} className="w-full h-auto rounded-xl border border-[var(--line)] touch-none" />
          <div className="mt-3 flex items-center justify-between font-mono text-xs tracking-[0.2em] uppercase text-[var(--fg-muted)]">
            <span>{state === 'over' ? 'Game over · toca para reiniciar' : state === 'idle' ? 'Toca para empezar' : 'Corriendo'}</span>
            <span className="tabular-nums">Score {String(score).padStart(4, '0')} · Hi {String(hi).padStart(4, '0')}</span>
          </div>
        </div>

        <div className="mt-8"><Link href="/" className="btn btn-ghost"><span>Volver al inicio</span><span aria-hidden>→</span></Link></div>
      </div>
    </main>
  )
}
