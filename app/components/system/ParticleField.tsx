'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import { useAnimationLoop } from '../../hooks/useAnimationLoop'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])

  const setup = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ratio = window.devicePixelRatio || 1
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    canvas.width = width * ratio
    canvas.height = height * ratio
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)

    particlesRef.current = Array.from({ length: 26 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
      r: 1 + Math.random() * 2.3,
    }))
  }, [])

  useEffect(() => {
    setup()
    window.addEventListener('resize', setup)
    return () => window.removeEventListener('resize', setup)
  }, [setup])

  useAnimationLoop(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.clientWidth
    const height = canvas.clientHeight

    ctx.clearRect(0, 0, width, height)
    particlesRef.current.forEach((particle) => {
      particle.x += particle.vx
      particle.y += particle.vy

      if (particle.x < 0 || particle.x > width) particle.vx *= -1
      if (particle.y < 0 || particle.y > height) particle.vy *= -1

      const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.r * 5)
      gradient.addColorStop(0, 'rgba(155,95,214,0.7)')
      gradient.addColorStop(1, 'rgba(155,95,214,0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.r * 5, 0, Math.PI * 2)
      ctx.fill()
    })
  })

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
}
