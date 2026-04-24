'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface Point {
  x: number
  y: number
}

interface Stroke {
  points: Point[]
  color: string
  size: number
  tool: 'pencil' | 'marker' | 'ink' | 'eraser'
}

export const TOOLS = [
  { id: 'pencil' as const, label: 'LÁPIZ', size: 2.2, icon: '✎' },
  { id: 'marker' as const, label: 'MARCADOR', size: 7.5, icon: '▬' },
  { id: 'ink' as const, label: 'NEON', size: 4.8, icon: '≈' },
  { id: 'eraser' as const, label: 'BORRADOR', size: 11, icon: '⌫' },
]

export const COLORS = ['#111111', '#9b5fd6', '#c026d3', '#5a3d7a']

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
  currentTool: 'pencil' | 'marker' | 'ink' | 'eraser'
  setCurrentTool: (tool: 'pencil' | 'marker' | 'ink' | 'eraser') => void
  setBrushSize: (size: number) => void
  isDrawing: boolean
  strokeCount: number
}

export function useCanvasDrawing(): CanvasDrawingReturn {
  const [currentTool, setCurrentTool] = useState<'pencil' | 'marker' | 'ink' | 'eraser'>('pencil')
  const [color, setColor] = useState('#111111')
  const [isDrawing, setIsDrawing] = useState(false)
  const [strokeCount, setStrokeCount] = useState(0)
  const [brushSize, setBrushSize] = useState(6)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokesRef = useRef<Stroke[]>([])
  const currentStrokeRef = useRef<Stroke | null>(null)

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cssW = canvas.width / (window.devicePixelRatio || 1)
    const cssH = canvas.height / (window.devicePixelRatio || 1)

    ctx.fillStyle = '#f8f5f0'
    ctx.fillRect(0, 0, cssW, cssH)

    ctx.fillStyle = 'rgba(155, 95, 214, 0.012)'
    for (let i = 0; i < 180; i++) {
      ctx.fillRect(Math.random() * cssW, Math.random() * cssH, 1.2, 1.2)
    }

    strokesRef.current.forEach((stroke) => {
      if (stroke.points.length < 2) return
      const strokeColor = stroke.tool === 'eraser' ? '#f8f5f0' : stroke.color

      ctx.strokeStyle = strokeColor
      ctx.lineWidth = stroke.size
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.shadowColor = strokeColor
      ctx.shadowBlur = stroke.tool === 'ink' ? 6 : 0

      ctx.beginPath()
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)

      for (let i = 1; i < stroke.points.length; i++) {
        const p = stroke.points[i]
        if (i > 1) {
          const prev = stroke.points[i - 1]
          const midX = (prev.x + p.x) / 2
          const midY = (prev.y + p.y) / 2
          ctx.quadraticCurveTo(prev.x, prev.y, midX, midY)
        } else {
          ctx.lineTo(p.x, p.y)
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
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 2)

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

    const resizeObserver = new ResizeObserver(setupCanvas)
    resizeObserver.observe(canvas)
    setupCanvas()

    return () => resizeObserver.disconnect()
  }, [setupCanvas])

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture(e.pointerId)

    const point = getPoint(e)
    const toolConfig = TOOLS.find((t) => t.id === currentTool)!
    const baseSize = currentTool === 'eraser' ? brushSize : Math.max(1, brushSize * (toolConfig.size / 4))

    setIsDrawing(true)
    currentStrokeRef.current = {
      points: [point],
      color,
      size: baseSize * Math.max(e.pressure || 0.6, 0.35),
      tool: currentTool,
    }
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current) return
    const stroke = currentStrokeRef.current
    stroke.points.push(getPoint(e))
    redraw()
  }

  const stop = () => {
    if (!isDrawing || !currentStrokeRef.current) return
    setIsDrawing(false)

    if (currentStrokeRef.current.points.length > 1) {
      strokesRef.current.push(currentStrokeRef.current)
      setStrokeCount(strokesRef.current.length)
    }
    currentStrokeRef.current = null
    redraw()
  }

  const clear = () => {
    strokesRef.current = []
    setStrokeCount(0)
    setIsDrawing(false)
    redraw()
  }

  const undo = () => {
    strokesRef.current.pop()
    setStrokeCount(strokesRef.current.length)
    redraw()
  }

  const exportImage = () => canvasRef.current?.toDataURL('image/png', 0.92)

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
    setBrushSize,
    isDrawing,
    strokeCount,
  }
}
