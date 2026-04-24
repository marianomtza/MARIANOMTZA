'use client'

import React, { useEffect, useRef } from 'react'

const DPR_CAP = 1.75

export function HeroScene3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })
    if (!ctx) return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pointer = { x: 0.5, y: 0.5 }
    const smooth = { x: 0.5, y: 0.5 }
    let raf = 0
    let visible = true
    let time = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP)
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      pointer.x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
      pointer.y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && !raf) raf = requestAnimationFrame(tick)
      },
      { threshold: 0.01 }
    )

    const tick = () => {
      raf = 0
      if (!visible) return

      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (!width || !height) return

      const reduce = media.matches
      const targetEase = reduce ? 0.035 : 0.075
      smooth.x += (pointer.x - smooth.x) * targetEase
      smooth.y += (pointer.y - smooth.y) * targetEase
      time += reduce ? 0.004 : 0.012

      ctx.clearRect(0, 0, width, height)

      const cx = width * 0.5 + (smooth.x - 0.5) * width * (reduce ? 0.03 : 0.08)
      const cy = height * 0.48 + (smooth.y - 0.5) * height * (reduce ? 0.02 : 0.06)

      const layers = reduce ? 26 : 44
      for (let i = 0; i < layers; i++) {
        const t = i / layers
        const depth = 1 - t
        const radiusX = (width * (0.1 + t * 0.92)) * (1 + Math.sin(time * 2.6 + i * 0.22) * 0.02)
        const radiusY = (height * (0.08 + t * 0.72)) * (1 + Math.cos(time * 2.1 + i * 0.18) * 0.03)
        const wobble = reduce ? 0.2 : 1
        const ox = Math.sin(time * 1.8 + i * 0.16) * 16 * wobble + (smooth.x - 0.5) * depth * 20
        const oy = Math.cos(time * 1.4 + i * 0.21) * 11 * wobble + (smooth.y - 0.5) * depth * 16

        ctx.beginPath()
        ctx.ellipse(cx + ox, cy + oy, radiusX, radiusY, time * 0.08 + i * 0.013, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(139,92,246,${0.012 + depth * 0.075})`
        ctx.lineWidth = 0.65 + depth * 1.6
        ctx.stroke()
      }

      const pulse = 0.5 + Math.sin(time * 4.6) * 0.5
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.56)
      glow.addColorStop(0, `rgba(167,139,250,${reduce ? 0.08 : 0.15 + pulse * 0.08})`)
      glow.addColorStop(0.45, 'rgba(91,33,182,0.06)')
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)

      raf = requestAnimationFrame(tick)
    }

    resize()
    io.observe(canvas)
    canvas.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('resize', resize)
    media.addEventListener('change', resize)
    raf = requestAnimationFrame(tick)

    return () => {
      io.disconnect()
      canvas.removeEventListener('pointermove', onPointer)
      window.removeEventListener('resize', resize)
      media.removeEventListener('change', resize)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
}
