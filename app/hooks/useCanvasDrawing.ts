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
  { id: 'eraser' as const, label: 'BORRAR', size: 12, icon: '⌫' },
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
  brushSize: number
  setBrushSize: (value: number) => void
  isDrawing: boolean
  strokeCount: number
}

export function useCanvasDrawing(): CanvasDrawingReturn {
  const [currentTool, setCurrentTool] = useState<'pencil' | 'marker' | 'ink' | 'eraser'>('pencil')
  const [color, setColor] = useState('#111111')
  const [brushSize, setBrushSize] = useState(1)
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
      ctx.fillRect(Math.random() * cssW, Math.random() * cssH, 1.2, 1.2)
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

      const strokeColor = stroke.tool === 'eraser' ? '#f8f5f0' : stroke.color
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = stroke.size
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.shadowColor = strokeColor
      ctx.shadowBlur = stroke.tool === 'ink' ? 6 : stroke.tool === 'marker' ? 1.5 : 0

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
          ctx.lineTo(x + (Math.random() - 0.5) * 1.8, y + (Math.random() - 0.5) * 1.8)
          ctx.stroke()
          ctx.restore()

          ctx.globalAlpha = 1
          ctx.lineWidth = stroke.size
          ctx.shadowBlur = 6
        }

        if (i > 1) {
          const prev = stroke.points[i - 1]
          ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + x) / 2, (prev.y + y) / 2)
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

    redraw()
  }, [redraw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeObserver = new ResizeObserver(setupCanvas)
    resizeObserver.observe(canvas)
    window.setTimeout(setupCanvas, 50)

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

    const point = getPoint(e)
    const toolConfig = TOOLS.find((t) => t.id === currentTool)!
    const paintColor = currentTool === 'eraser' ? '#f8f5f0' : color

    setIsDrawing(true)
    currentStrokeRef.current = {
      points: [point],
      color: paintColor,
      size: toolConfig.size * brushSize * Math.max(e.pressure || 0.65, 0.5) * (currentTool === 'marker' ? 1.1 : 1),
      tool: currentTool,
    }

    const ctx = canvas.getContext('2d')!
    ctx.strokeStyle = paintColor
    ctx.lineWidth = currentStrokeRef.current.size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowColor = paintColor
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
      ctx.lineTo(drawX + (Math.random() - 0.5) * 2.2, drawY + (Math.random() - 0.5) * 2.2)
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
      setStrokeCount((c) => c + 1)
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
    setStrokeCount((c) => Math.max(0, c - 1))
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
    brushSize,
    setBrushSize,
    isDrawing,
    strokeCount,
  }
}
