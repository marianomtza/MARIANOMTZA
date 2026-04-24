'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface Point {
  x: number
  y: number
  pressure: number
}

type Tool = 'pencil' | 'marker' | 'ink' | 'chalk' | 'spray' | 'ribbon'

interface Stroke {
  points: Point[]
  color: string
  size: number
  tool: Tool
}

export const TOOLS = [
  { id: 'pencil' as const, label: 'LÁPIZ', size: 2.1, icon: '✎' },
  { id: 'marker' as const, label: 'MARCADOR', size: 6.8, icon: '▬' },
  { id: 'ink' as const, label: 'TINTA', size: 4.5, icon: '≈' },
  { id: 'chalk' as const, label: 'TIZA', size: 5.6, icon: '▩' },
  { id: 'spray' as const, label: 'SPRAY', size: 3.8, icon: '✹' },
  { id: 'ribbon' as const, label: 'RIBBON', size: 3.2, icon: '∞' },
]

export const COLORS = [
  '#111111',
  '#5a3d7a',
  '#9b5fd6',
  '#c026d3',
  '#3a86ff',
  '#00b4d8',
  '#ef476f',
  '#ffd166',
  '#06d6a0',
  '#f8f5f0',
]

export interface CanvasDrawingReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>
  start: (e: React.PointerEvent<HTMLCanvasElement>) => void
  draw: (e: React.PointerEvent<HTMLCanvasElement>) => void
  stop: () => void
  clear: () => void
  exportImage: () => string | undefined
  undo: () => void
  color: string
  setColor: (color: string) => void
  currentTool: Tool
  setCurrentTool: (tool: Tool) => void
  isDrawing: boolean
  strokeCount: number
}

export function useCanvasDrawing(): CanvasDrawingReturn {
  const [currentTool, setCurrentTool] = useState<Tool>('pencil')
  const [color, setColor] = useState('#111111')
  const [isDrawing, setIsDrawing] = useState(false)
  const [strokeCount, setStrokeCount] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokesRef = useRef<Stroke[]>([])
  const currentStrokeRef = useRef<Stroke | null>(null)
  const rafRef = useRef<number | null>(null)

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, cssW: number, cssH: number) => {
    const paper = ctx.createLinearGradient(0, 0, cssW, cssH)
    paper.addColorStop(0, '#faf7f3')
    paper.addColorStop(1, '#f3eee7')
    ctx.fillStyle = paper
    ctx.fillRect(0, 0, cssW, cssH)

    ctx.fillStyle = 'rgba(155, 95, 214, 0.03)'
    for (let i = 0; i < 220; i++) {
      const x = Math.random() * cssW
      const y = Math.random() * cssH
      ctx.fillRect(x, y, 1.1, 1.1)
    }

    ctx.strokeStyle = 'rgba(17, 17, 17, 0.025)'
    ctx.lineWidth = 0.5
    for (let x = 12; x < cssW; x += 14) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + (Math.random() - 0.5), cssH)
      ctx.stroke()
    }
  }, [])

  const renderStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 2) return

    ctx.save()
    ctx.strokeStyle = stroke.color
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (stroke.tool === 'spray') {
      stroke.points.forEach((point) => {
        const dots = Math.round(10 + point.pressure * 16)
        for (let i = 0; i < dots; i++) {
          const angle = Math.random() * Math.PI * 2
          const radius = Math.random() * stroke.size * (1.5 + point.pressure)
          const px = point.x + Math.cos(angle) * radius
          const py = point.y + Math.sin(angle) * radius
          ctx.globalAlpha = 0.04 + Math.random() * 0.1
          ctx.fillStyle = stroke.color
          ctx.beginPath()
          ctx.arc(px, py, 0.7 + Math.random() * 1.1, 0, Math.PI * 2)
          ctx.fill()
        }
      })
      ctx.restore()
      return
    }

    if (stroke.tool === 'chalk') {
      ctx.globalAlpha = 0.78
      ctx.shadowBlur = 0
      ctx.setLineDash([1.5, 2.5])
    }

    if (stroke.tool === 'ink') {
      ctx.shadowColor = stroke.color
      ctx.shadowBlur = 7
    }

    if (stroke.tool === 'marker') {
      ctx.globalAlpha = 0.3
    }

    for (let i = 1; i < stroke.points.length; i++) {
      const p0 = stroke.points[i - 1]
      const p1 = stroke.points[i]
      const width = Math.max(0.8, stroke.size * (0.45 + p1.pressure * 0.85))
      ctx.lineWidth = width

      ctx.beginPath()
      ctx.moveTo(p0.x, p0.y)
      const cx = (p0.x + p1.x) / 2
      const cy = (p0.y + p1.y) / 2

      if (stroke.tool === 'ribbon') {
        const offX = (Math.random() - 0.5) * 1.2
        const offY = (Math.random() - 0.5) * 1.2
        ctx.quadraticCurveTo(p0.x + offX, p0.y + offY, cx, cy)
      } else {
        ctx.quadraticCurveTo(p0.x, p0.y, cx, cy)
      }
      ctx.stroke()

      if (stroke.tool === 'ink' && i % 4 === 0) {
        ctx.globalAlpha = 0.09
        ctx.lineWidth = width * 1.6
        ctx.beginPath()
        ctx.moveTo(p0.x + (Math.random() - 0.5) * 1.8, p0.y + (Math.random() - 0.5) * 1.8)
        ctx.quadraticCurveTo(p0.x, p0.y, cx, cy)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    }

    ctx.restore()
  }, [])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cssW = canvas.width / (window.devicePixelRatio || 1)
    const cssH = canvas.height / (window.devicePixelRatio || 1)

    drawBackground(ctx, cssW, cssH)
    strokesRef.current.forEach((stroke) => renderStroke(ctx, stroke))
    if (currentStrokeRef.current) renderStroke(ctx, currentStrokeRef.current)
  }, [drawBackground, renderStroke])

  const scheduleRedraw = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      redraw()
    })
  }, [redraw])

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const dpr = Math.max(window.devicePixelRatio || 1, 1)

    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor(rect.height * dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    redraw()
  }, [redraw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeObserver = new ResizeObserver(() => {
      setupCanvas()
    })

    resizeObserver.observe(canvas)
    window.setTimeout(setupCanvas, 40)

    return () => {
      resizeObserver.disconnect()
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [setupCanvas])

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const normalizedPressure = e.pressure > 0 ? e.pressure : 0.52
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: Math.min(1, Math.max(0.1, normalizedPressure)),
    }
  }

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const toolConfig = TOOLS.find((t) => t.id === currentTool)
    if (!toolConfig) return

    e.currentTarget.setPointerCapture(e.pointerId)
    const point = getPoint(e)

    setIsDrawing(true)
    currentStrokeRef.current = {
      points: [point],
      color,
      size: toolConfig.size,
      tool: currentTool,
    }
    scheduleRedraw()
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current) return

    const point = getPoint(e)
    const stroke = currentStrokeRef.current
    const last = stroke.points[stroke.points.length - 1]
    const smooth: Point = {
      x: last.x + (point.x - last.x) * 0.68,
      y: last.y + (point.y - last.y) * 0.68,
      pressure: last.pressure + (point.pressure - last.pressure) * 0.58,
    }

    stroke.points.push(smooth)
    scheduleRedraw()
  }

  const stop = () => {
    if (!isDrawing || !currentStrokeRef.current) return
    setIsDrawing(false)

    if (currentStrokeRef.current.points.length > 1) {
      strokesRef.current.push(currentStrokeRef.current)
      setStrokeCount(strokesRef.current.length)
    }
    currentStrokeRef.current = null
    scheduleRedraw()
  }

  const clear = () => {
    strokesRef.current = []
    setStrokeCount(0)
    setIsDrawing(false)
    currentStrokeRef.current = null
    redraw()
  }

  const undo = () => {
    strokesRef.current.pop()
    setStrokeCount(strokesRef.current.length)
    redraw()
  }

  const exportImage = () => canvasRef.current?.toDataURL('image/png', 0.94)

  return {
    canvasRef,
    start,
    draw,
    stop,
    clear,
    exportImage,
    undo,
    color,
    setColor,
    currentTool,
    setCurrentTool,
    isDrawing,
    strokeCount,
  }
}
