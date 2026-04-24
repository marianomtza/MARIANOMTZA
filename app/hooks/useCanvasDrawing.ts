'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface Point {
  x: number
  y: number
  pressure: number
}

export type DrawingTool = 'pencil' | 'marker' | 'ink' | 'eraser'

interface Stroke {
  points: Point[]
  color: string
  size: number
  tool: DrawingTool
}

export const TOOLS = [
  { id: 'pencil' as const, label: 'Lápiz', size: 2.2, icon: '✎' },
  { id: 'marker' as const, label: 'Marcador', size: 7.5, icon: '▬' },
  { id: 'ink' as const, label: 'Tinta', size: 4.8, icon: '≈' },
  { id: 'eraser' as const, label: 'Borrador', size: 14, icon: '⌫' },
]

export const COLORS = ['#111111', '#8B5CF6', '#3772FF', '#DF2935', '#FDCA40', '#F8F5F0']

export interface CanvasDrawingReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>
  start: (e: React.PointerEvent<HTMLCanvasElement>) => void
  draw: (e: React.PointerEvent<HTMLCanvasElement>) => void
  stop: (e?: React.PointerEvent<HTMLCanvasElement>) => void
  clear: () => void
  exportImage: () => string | undefined
  exportWebpBlob: (maxSide?: number, quality?: number) => Promise<Blob | null>
  undo: () => void
  redo: () => void
  color: string
  setColor: (color: string) => void
  activeTool: DrawingTool
  setCurrentTool: (tool: DrawingTool) => void
  size: number
  setSize: (size: number) => void
  isDrawing: boolean
  strokeCount: number
  strokes: Stroke[]
  setStrokes: (strokes: Stroke[]) => void
}

const PAPER = '#f8f5f0'

export function useCanvasDrawing(): CanvasDrawingReturn {
  const [activeTool, setActiveTool] = useState<DrawingTool>('pencil')
  const [color, setColor] = useState('#111111')
  const [size, setSize] = useState(1)
  const [isDrawing, setIsDrawing] = useState(false)
  const [strokeCount, setStrokeCount] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokesRef = useRef<Stroke[]>([])
  const redoRef = useRef<Stroke[]>([])
  const currentStrokeRef = useRef<Stroke | null>(null)

  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 2) return

    ctx.save()
    ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
    ctx.strokeStyle = stroke.tool === 'eraser' ? 'rgba(0,0,0,1)' : stroke.color
    ctx.lineWidth = stroke.size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowColor = stroke.tool === 'eraser' ? 'transparent' : stroke.color
    ctx.shadowBlur = stroke.tool === 'ink' ? 6 : stroke.tool === 'marker' ? 1.5 : 0

    const first = stroke.points[0]
    ctx.beginPath()
    ctx.moveTo(first.x, first.y)

    for (let i = 1; i < stroke.points.length; i += 1) {
      const prev = stroke.points[i - 1]
      const p = stroke.points[i]
      const midX = (prev.x + p.x) / 2
      const midY = (prev.y + p.y) / 2
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY)
    }

    ctx.stroke()
    ctx.restore()
  }, [])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const cssW = canvas.width / dpr
    const cssH = canvas.height / dpr

    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()

    ctx.fillStyle = PAPER
    ctx.fillRect(0, 0, cssW, cssH)

    strokesRef.current.forEach((stroke) => drawStroke(ctx, stroke))
  }, [drawStroke])

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
    const observer = new ResizeObserver(() => setupCanvas())
    observer.observe(canvas)
    setTimeout(setupCanvas, 20)
    return () => observer.disconnect()
  }, [setupCanvas])

  const getPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.65,
    }
  }, [])

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture(e.pointerId)

    const point = getPoint(e)
    const config = TOOLS.find((t) => t.id === activeTool)!
    const baseSize = config.size * size

    currentStrokeRef.current = {
      points: [point],
      color,
      size: baseSize * (activeTool === 'marker' ? 1.1 : 1) * point.pressure,
      tool: activeTool,
    }

    setIsDrawing(true)
    redoRef.current = []
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current) return
    const stroke = currentStrokeRef.current

    const events = typeof (e.nativeEvent as any).getCoalescedEvents === 'function' ? (e.nativeEvent as any).getCoalescedEvents() : [e.nativeEvent]
    events.forEach((ev) => {
      const point = getPoint({ ...e, clientX: ev.clientX, clientY: ev.clientY, pressure: ev.pressure } as React.PointerEvent<HTMLCanvasElement>)
      stroke.points.push(point)
    })

    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    drawStroke(ctx, stroke)
  }

  const stop = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (e && canvasRef.current?.hasPointerCapture(e.pointerId)) {
      canvasRef.current.releasePointerCapture(e.pointerId)
    }

    if (!isDrawing || !currentStrokeRef.current) return

    if (currentStrokeRef.current.points.length > 1) {
      strokesRef.current = [...strokesRef.current, currentStrokeRef.current]
      setStrokeCount(strokesRef.current.length)
    }

    currentStrokeRef.current = null
    setIsDrawing(false)
  }

  const clear = () => {
    strokesRef.current = []
    redoRef.current = []
    setStrokeCount(0)
    setIsDrawing(false)
    redraw()
  }

  const undo = () => {
    if (!strokesRef.current.length) return
    const removed = strokesRef.current[strokesRef.current.length - 1]
    redoRef.current = [...redoRef.current, removed]
    strokesRef.current = strokesRef.current.slice(0, -1)
    setStrokeCount(strokesRef.current.length)
    redraw()
  }

  const redo = () => {
    if (!redoRef.current.length) return
    const restored = redoRef.current[redoRef.current.length - 1]
    redoRef.current = redoRef.current.slice(0, -1)
    strokesRef.current = [...strokesRef.current, restored]
    setStrokeCount(strokesRef.current.length)
    redraw()
  }

  const exportImage = () => canvasRef.current?.toDataURL('image/png', 0.94)

  const exportWebpBlob = async (maxSide = 1200, quality = 0.88) => {
    const source = canvasRef.current
    if (!source) return null

    const target = document.createElement('canvas')
    const ratio = source.width / source.height
    const width = Math.min(source.width, maxSide)
    const height = Math.round(width / ratio)
    target.width = width
    target.height = height
    const ctx = target.getContext('2d')
    if (!ctx) return null

    ctx.fillStyle = PAPER
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(source, 0, 0, width, height)

    return await new Promise<Blob | null>((resolve) => {
      target.toBlob((blob) => resolve(blob), 'image/webp', quality)
    })
  }

  const setStrokes = (strokes: Stroke[]) => {
    strokesRef.current = strokes
    setStrokeCount(strokes.length)
    redraw()
  }

  return {
    canvasRef,
    start,
    draw,
    stop,
    clear,
    exportImage,
    exportWebpBlob,
    undo,
    redo,
    color,
    setColor,
    activeTool,
    setCurrentTool: setActiveTool,
    size,
    setSize,
    isDrawing,
    strokeCount,
    strokes: strokesRef.current,
    setStrokes,
  }
}
