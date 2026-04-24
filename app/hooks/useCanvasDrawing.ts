'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface Point {
  x: number
  y: number
}

export type ToolId = 'pencil' | 'marker' | 'ink' | 'spray' | 'neon' | 'eraser'

interface Stroke {
  points: Point[]
  color: string
  size: number
  opacity: number
  tool: ToolId
}

export const TOOLS = [
  { id: 'pencil' as const, label: 'LÁPIZ', size: 2.2, icon: '✎' },
  { id: 'marker' as const, label: 'MARCADOR', size: 7.5, icon: '▬' },
  { id: 'ink' as const, label: 'TINTA', size: 4.8, icon: '≈' },
  { id: 'spray' as const, label: 'SPRAY', size: 11, icon: '✷' },
  { id: 'neon' as const, label: 'NEÓN', size: 3.8, icon: '✦' },
  { id: 'eraser' as const, label: 'BORRAR', size: 18, icon: '⌫' },
]

export const COLORS = [
  '#111111',
  '#ffffff',
  '#9b5fd6',
  '#c026d3',
  '#5a3d7a',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
]

const PAPER_BG = '#f8f5f0'

export interface CanvasDrawingReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>
  start: (e: React.PointerEvent<HTMLCanvasElement>) => void
  draw: (e: React.PointerEvent<HTMLCanvasElement>) => void
  stop: () => void
  clear: () => void
  exportImage: () => string | undefined
  undo: () => void
  redo: () => void
  color: string
  setColor: (color: string) => void
  currentTool: ToolId
  setCurrentTool: (tool: ToolId) => void
  brushSize: number
  setBrushSize: (size: number) => void
  opacity: number
  setOpacity: (opacity: number) => void
  isDrawing: boolean
  strokeCount: number
  canUndo: boolean
  canRedo: boolean
}

export function useCanvasDrawing(): CanvasDrawingReturn {
  const [currentTool, setCurrentTool] = useState<ToolId>('pencil')
  const [color, setColor] = useState('#111111')
  const [isDrawing, setIsDrawing] = useState(false)
  const [strokeCount, setStrokeCount] = useState(0)
  const [brushSize, setBrushSize] = useState(3)
  const [opacity, setOpacity] = useState(0.9)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokesRef = useRef<Stroke[]>([])
  const undoneRef = useRef<Stroke[]>([])
  const currentStrokeRef = useRef<Stroke | null>(null)

  const canUndo = strokeCount > 0
  const canRedo = undoneRef.current.length > 0

  const drawPaper = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = PAPER_BG
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = 'rgba(155, 95, 214, 0.012)'
    for (let i = 0; i < 180; i++) {
      const x = (i * 97) % width
      const y = (i * 131) % height
      ctx.fillRect(x, y, 1.2, 1.2)
    }

    ctx.strokeStyle = 'rgba(17, 17, 17, 0.035)'
    ctx.lineWidth = 0.4
    for (let x = 8; x < width; x += 11) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + ((x % 7) - 3) * 0.2, height)
      ctx.stroke()
    }
  }, [])

  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 1) return

    if (stroke.tool === 'spray') {
      ctx.save()
      ctx.globalAlpha = stroke.opacity * 0.7
      ctx.fillStyle = stroke.color

      stroke.points.forEach((point, index) => {
        const density = Math.max(10, Math.floor(stroke.size * 1.1))
        for (let i = 0; i < density; i++) {
          const angle = ((index + i) * 2.39996323) % (Math.PI * 2)
          const radius = Math.sqrt((i + 1) / density) * stroke.size
          const jitter = ((index * 13 + i * 17) % 11) * 0.03
          const x = point.x + Math.cos(angle) * (radius + jitter)
          const y = point.y + Math.sin(angle) * (radius + jitter)
          ctx.fillRect(x, y, 1.15, 1.15)
        }
      })
      ctx.restore()
      return
    }

    ctx.save()
    ctx.globalAlpha = stroke.opacity
    ctx.lineCap = stroke.tool === 'marker' ? 'square' : 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = stroke.size

    if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
    } else {
      ctx.strokeStyle = stroke.color
    }

    if (stroke.tool === 'ink') {
      ctx.shadowColor = stroke.color
      ctx.shadowBlur = 6
    } else if (stroke.tool === 'neon') {
      ctx.shadowColor = stroke.color
      ctx.shadowBlur = 12
    } else {
      ctx.shadowBlur = 0
    }

    ctx.beginPath()
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y)

    for (let i = 1; i < stroke.points.length; i++) {
      const prev = stroke.points[i - 1]
      const p = stroke.points[i]
      const midX = (prev.x + p.x) / 2
      const midY = (prev.y + p.y) / 2
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY)
    }

    if (stroke.points.length === 1) {
      const p = stroke.points[0]
      ctx.lineTo(p.x + 0.1, p.y + 0.1)
    }

    ctx.stroke()
    ctx.restore()
  }, [])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width / (window.devicePixelRatio || 1)
    const height = canvas.height / (window.devicePixelRatio || 1)

    drawPaper(ctx, width, height)
    strokesRef.current.forEach(stroke => drawStroke(ctx, stroke))
  }, [drawPaper, drawStroke])

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

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)

    redraw()
  }, [redraw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeObserver = new ResizeObserver(() => {
      setupCanvas()
    })

    resizeObserver.observe(canvas)
    setTimeout(setupCanvas, 30)

    return () => resizeObserver.disconnect()
  }, [setupCanvas])

  useEffect(() => {
    const tool = TOOLS.find(t => t.id === currentTool)
    if (!tool) return
    if (currentTool === 'eraser') {
      setOpacity(1)
    }
    setBrushSize(tool.size)
  }, [currentTool])

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

    canvas.setPointerCapture(e.pointerId)

    const point = getPoint(e)

    setIsDrawing(true)
    undoneRef.current = []

    currentStrokeRef.current = {
      points: [point],
      color,
      size: Math.max(1, brushSize * (currentTool === 'marker' ? 1.05 : 1)),
      opacity: currentTool === 'eraser' ? 1 : opacity,
      tool: currentTool,
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawStroke(ctx, currentStrokeRef.current)
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current) return

    const point = getPoint(e)
    const stroke = currentStrokeRef.current
    stroke.points.push(point)

    if (stroke.points.length % 2 === 0 && stroke.tool !== 'spray') {
      return
    }

    redraw()
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    drawStroke(ctx, stroke)
  }

  const stop = () => {
    if (!isDrawing || !currentStrokeRef.current) return

    const stroke = currentStrokeRef.current

    setIsDrawing(false)
    currentStrokeRef.current = null

    if (stroke.points.length > 0) {
      strokesRef.current.push(stroke)
      setStrokeCount(strokesRef.current.length)
      redraw()
    }
  }

  const clear = () => {
    strokesRef.current = []
    undoneRef.current = []
    setStrokeCount(0)
    setIsDrawing(false)
    redraw()
  }

  const undo = () => {
    const last = strokesRef.current.pop()
    if (last) {
      undoneRef.current.push(last)
      setStrokeCount(strokesRef.current.length)
      redraw()
    }
  }

  const redo = () => {
    const restored = undoneRef.current.pop()
    if (restored) {
      strokesRef.current.push(restored)
      setStrokeCount(strokesRef.current.length)
      redraw()
    }
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
    redo,
    color,
    setColor,
    currentTool,
    setCurrentTool,
    brushSize,
    setBrushSize,
    opacity,
    setOpacity,
    isDrawing,
    strokeCount,
    canUndo,
    canRedo,
  }
}
