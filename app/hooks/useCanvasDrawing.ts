'use client'

import { useRef, useState, useEffect, useCallback, useMemo } from 'react'

interface Point {
  x: number
  y: number
}

interface Stroke {
  points: Point[]
  color: string
  size: number
  tool: 'pencil' | 'marker' | 'ink'
}

export const TOOLS = [
  { id: 'pencil' as const, label: 'LÁPIZ', size: 2.2, icon: '✎' },
  { id: 'marker' as const, label: 'MARCADOR', size: 7.5, icon: '▬' },
  { id: 'ink' as const, label: 'TINTA', size: 4.8, icon: '≈' },
]

export const COLORS = ['#111111', '#8B5CF6', '#3772FF', '#DF2935', '#FDCA40', '#F8F5F0']

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
  currentTool: 'pencil' | 'marker' | 'ink'
  setCurrentTool: (tool: 'pencil' | 'marker' | 'ink') => void
  isDrawing: boolean
  strokeCount: number
}

export function useCanvasDrawing(): CanvasDrawingReturn {
  const [currentTool, setCurrentTool] = useState<'pencil' | 'marker' | 'ink'>('pencil')
  const [color, setColor] = useState('#111111')
  const [isDrawing, setIsDrawing] = useState(false)
  const [strokeCount, setStrokeCount] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokesRef = useRef<Stroke[]>([])
  const currentStrokeRef = useRef<Stroke | null>(null)

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const cssW = canvas.width / (window.devicePixelRatio || 1)
    const cssH = canvas.height / (window.devicePixelRatio || 1)

    ctx.fillStyle = '#f8f5f0'
    ctx.fillRect(0, 0, cssW, cssH)

    ctx.fillStyle = 'rgba(155, 95, 214, 0.012)'
    for (let i = 0; i < 280; i++) {
      const x = Math.random() * cssW
      const y = Math.random() * cssH
      ctx.fillRect(x, y, 1.2, 1.2)
    }

    ctx.strokeStyle = 'rgba(17, 17, 17, 0.035)'
    ctx.lineWidth = 0.4
    for (let x = 8; x < cssW; x += 11) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + (Math.random() - 0.5) * 0.8, cssH)
      ctx.stroke()
    }

    strokesRef.current.forEach((stroke) => {
      if (stroke.points.length < 2) return

      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.size
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.shadowColor = stroke.color
      ctx.shadowBlur = stroke.tool === 'ink' ? 6 : (stroke.tool === 'marker' ? 1.5 : 0)

      ctx.beginPath()
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)

      for (let i = 1; i < stroke.points.length; i++) {
        const p = stroke.points[i]
        let x = p.x
        let y = p.y

        if (stroke.tool === 'pencil' && i % 2 === 0) {
          x += (Math.random() - 0.5) * 0.9
          y += (Math.random() - 0.5) * 0.9
        }

        if (stroke.tool === 'ink' && i % 3 === 0) {
          ctx.save()
          ctx.globalAlpha = 0.12 + Math.random() * 0.08
          ctx.lineWidth = stroke.size * 1.65
          ctx.shadowBlur = 9
          const ox = (Math.random() - 0.5) * 1.8
          const oy = (Math.random() - 0.5) * 1.8
          ctx.lineTo(x + ox, y + oy)
          ctx.stroke()
          ctx.restore()

          ctx.globalAlpha = 1
          ctx.lineWidth = stroke.size
          ctx.shadowBlur = 6
        }

        if (i > 1) {
          const prev = stroke.points[i - 1]
          const midX = (prev.x + x) / 2
          const midY = (prev.y + y) / 2
          ctx.quadraticCurveTo(prev.x, prev.y, midX, midY)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
    })

    ctx.shadowBlur = 0
  }, [])

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const dpr = Math.max(window.devicePixelRatio || 1, 1)

    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor(rect.height * dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })!
    ctx.scale(dpr, dpr)

    ctx.fillStyle = '#f8f5f0'
    ctx.fillRect(0, 0, rect.width, rect.height)

    ctx.strokeStyle = 'rgba(17, 17, 17, 0.035)'
    ctx.lineWidth = 0.4
    for (let x = 8; x < rect.width; x += 11) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + (Math.random() - 0.5) * 0.8, rect.height)
      ctx.stroke()
    }

    redraw()
  }, [redraw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeObserver = new ResizeObserver(() => {
      setupCanvas()
    })

    resizeObserver.observe(canvas)
    setTimeout(setupCanvas, 50)

    return () => resizeObserver.disconnect()
  }, [setupCanvas])

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const point = getPoint(e)
    const toolConfig = TOOLS.find(t => t.id === currentTool)!

    setIsDrawing(true)
    if (strokeCount === 0) setStrokeCount(1)
    currentStrokeRef.current = {
      points: [point],
      color: color,
      size: toolConfig.size * (e.pressure || 0.65) * (currentTool === 'marker' ? 1.1 : 1),
      tool: currentTool,
    }

    const ctx = canvas.getContext('2d')!
    ctx.strokeStyle = color
    ctx.lineWidth = currentStrokeRef.current.size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowColor = color
    ctx.shadowBlur = currentTool === 'ink' ? 5 : 0

    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current) return

    const point = getPoint(e)
    const stroke = currentStrokeRef.current
    stroke.points.push(point)

    const ctx = canvasRef.current!.getContext('2d')!

    let drawX = point.x
    let drawY = point.y

    if (stroke.tool === 'pencil') {
      drawX += (Math.random() - 0.5) * 0.7
      drawY += (Math.random() - 0.5) * 0.7
    }

    ctx.lineTo(drawX, drawY)
    ctx.stroke()

    if (stroke.tool === 'ink') {
      ctx.save()
      ctx.globalAlpha = 0.09
      ctx.lineWidth = stroke.size * 1.9
      ctx.shadowBlur = 10
      ctx.lineTo(
        drawX + (Math.random() - 0.5) * 2.2,
        drawY + (Math.random() - 0.5) * 2.2
      )
      ctx.stroke()
      ctx.restore()
      ctx.globalAlpha = 1
      ctx.lineWidth = stroke.size
      ctx.shadowBlur = 5
    }
  }

  const stop = () => {
    if (!isDrawing || !currentStrokeRef.current) return
    setIsDrawing(false)

    if (currentStrokeRef.current.points.length > 3) {
      strokesRef.current.push(currentStrokeRef.current)
      setStrokeCount(c => c + 1)
    }
    currentStrokeRef.current = null
  }

  const clear = () => {
    strokesRef.current = []
    setStrokeCount(0)
    setIsDrawing(false)
    redraw()
  }

  const undo = () => {
    strokesRef.current.pop()
    setStrokeCount(c => Math.max(0, c - 1))
    redraw()
  }

  const exportImage = () => {
    return canvasRef.current?.toDataURL('image/png', 0.94)
  }

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
