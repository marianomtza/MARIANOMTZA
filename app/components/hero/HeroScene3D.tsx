'use client'

import React, { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

export default function HeroScene3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frame = 0
    let raf = 0
    const pointer = { x: 0.5, y: 0.5 }

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      canvas.width = Math.floor(width * ratio)
      canvas.height = Math.floor(height * ratio)
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const lines = Array.from({ length: 28 }).map((_, i) => ({
      depth: 0.2 + i * 0.03,
      phase: Math.random() * Math.PI * 2,
      amp: 10 + Math.random() * 30,
    }))

    const particles = Array.from({ length: 65 }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.2 + Math.random() * 0.8,
      r: 0.6 + Math.random() * 1.8,
    }))

    const draw = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      frame += reduceMotion ? 0.004 : 0.015

      ctx.clearRect(0, 0, width, height)

      const grad = ctx.createRadialGradient(
        width * 0.56,
        height * 0.42,
        width * 0.05,
        width * 0.56,
        height * 0.45,
        width * 0.65
      )
      grad.addColorStop(0, 'rgba(155,95,214,0.22)')
      grad.addColorStop(0.5, 'rgba(76,29,149,0.16)')
      grad.addColorStop(1, 'rgba(8,8,12,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      ctx.save()
      ctx.translate(width * (pointer.x - 0.5) * 16, height * (pointer.y - 0.5) * 10)
      lines.forEach((line, i) => {
        const y = height * 0.22 + i * (height * 0.018)
        ctx.beginPath()
        for (let x = -40; x <= width + 40; x += 10) {
          const wave = Math.sin((x / 100) * (1.1 + line.depth) + frame * (2.2 - line.depth) + line.phase)
          const sway = Math.cos((x / 140) + frame * 1.2 + line.phase)
          const yy = y + wave * line.amp * line.depth + sway * 8 * line.depth
          if (x === -40) ctx.moveTo(x, yy)
          else ctx.lineTo(x, yy)
        }
        ctx.strokeStyle = `rgba(188, 153, 255, ${0.07 + line.depth * 0.22})`
        ctx.lineWidth = 0.7 + line.depth * 1.4
        ctx.stroke()
      })
      ctx.restore()

      particles.forEach((particle) => {
        const px = (particle.x + frame * 0.007 * particle.z) % 1
        const py = particle.y + Math.sin(frame * 2 + particle.x * Math.PI * 2) * 0.02
        const parallaxX = (pointer.x - 0.5) * 40 * particle.z
        const parallaxY = (pointer.y - 0.5) * 20 * particle.z
        ctx.beginPath()
        ctx.arc(px * width + parallaxX, py * height + parallaxY, particle.r * particle.z, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(232, 224, 255, ${0.08 + particle.z * 0.18})`
        ctx.fill()
      })

      raf = requestAnimationFrame(draw)
    }

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
      pointer.y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointer, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [reduceMotion])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden />
}
