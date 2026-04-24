'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type DrawingTool = 'pencil' | 'marker' | 'ink' | 'eraser'

export type Point = {
  x: number
  y: number
  pressure: number
}

export type Stroke = {
  id: string
  points: Point[]
  color: string
  size: number
  tool: DrawingTool
}

const TOOL_DEFAULTS: Record<DrawingTool, number> = {
  pencil: 2.4,
  marker: 7.5,
  ink: 4.8,
  eraser: 14,
}

export const TOOLS = [
  { id: 'pencil' as const, label: 'LÁPIZ', icon: '✎' },
  { id: 'marker' as const, label: 'MARCADOR', icon: '▬' },
  { id: 'ink' as const, label: 'TINTA', icon: '≈' },
  { id: 'eraser' as const, label: 'BORRADOR', icon: '⌫' },
]

export const COLORS = ['#111111', '#8B5CF6', '#3772FF', '#DF2935', '#FDCA40', '#F8F5F0']

type UseCanvasDrawingReturn = {
  canvasRef: React.RefObject<HTMLCanvasElement>
  strokes: Stroke[]
  canUndo: boolean
  canRedo: boolean
  hasContent: boolean
  color: string
  setColor: (value: string) => void
  currentTool: 'pencil' | 'marker' | 'ink'
  activeTool: DrawingTool
  setCurrentTool: (tool: DrawingTool) => void
  brushSize: number
  setBrushSize: (size: number) => void
  start: (e: React.PointerEvent<HTMLCanvasElement>) => void
  draw: (e: React.PointerEvent<HTMLCanvasElement>) => void
  stop: (e?: React.PointerEvent<HTMLCanvasElement>) => void
  clear: () => boolean
  undo: () => void
  redo: () => void
  exportPngBlob: () => Promise<Blob | null>
  exportImage: () => string | undefined
  strokeCount: number
  exportWebpBlob: (maxSize: number, quality?: number) => Promise<Blob | null>
  loadStrokes: (strokes: Stroke[]) => void
}

const PAPER_BASE = '#f8f5f0'

function createStableNoise(x: number, y: number) {
  const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return v - Math.floor(v)
}

function drawPaper(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save()
  ctx.fillStyle = PAPER_BASE
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = 'rgba(20, 20, 20, 0.03)'
  ctx.lineWidth = 0.5
  for (let x = 10; x < width; x += 12) {
    const wobble = (createStableNoise(x, 1) - 0.5) * 0.7
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + wobble, height)
    ctx.stroke()
  }

  ctx.fillStyle = 'rgba(90, 90, 90, 0.04)'
  for (let y = 2; y < height; y += 8) {
    for (let x = 2; x < width; x += 8) {
      if (createStableNoise(x, y) > 0.9) ctx.fillRect(x, y, 1, 1)
    }
  }

  ctx.restore()
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  if (!stroke.points.length) return

  ctx.save()
  if (stroke.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.strokeStyle = '#000'
    ctx.fillStyle = '#000'
    ctx.shadowBlur = 0
  } else {
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = stroke.color
    ctx.fillStyle = stroke.color
    ctx.shadowColor = stroke.tool === 'ink' ? stroke.color : 'transparent'
    ctx.shadowBlur = stroke.tool === 'ink' ? 5 : 0
  }

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (stroke.points.length === 1) {
    const p = stroke.points[0]
    ctx.beginPath()
    ctx.arc(p.x, p.y, Math.max(1, stroke.size * p.pressure * 0.5), 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    return
  }

  ctx.beginPath()
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y)

  for (let i = 1; i < stroke.points.length; i++) {
    const prev = stroke.points[i - 1]
    const current = stroke.points[i]
    const midX = (prev.x + current.x) / 2
    const midY = (prev.y + current.y) / 2
    ctx.lineWidth = Math.max(1, stroke.size * (current.pressure || 0.5))
    ctx.quadraticCurveTo(prev.x, prev.y, midX, midY)
  }

  ctx.stroke()
  ctx.restore()
}

export function useCanvasDrawing(): UseCanvasDrawingReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dprRef = useRef(1)
  const strokesRef = useRef<Stroke[]>([])
  const redoRef = useRef<Stroke[]>([])
  const currentStrokeRef = useRef<Stroke | null>(null)
  const isDrawingRef = useRef(false)
  const pointerIdRef = useRef<number | null>(null)

  const [, forceRerender] = useState(0)
  const [color, setColor] = useState(COLORS[0])
  const [activeTool, setActiveTool] = useState<DrawingTool>('pencil')
  const [brushSize, setBrushSize] = useState(TOOL_DEFAULTS.pencil)

  const flush = useCallback(() => forceRerender((v) => v + 1), [])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width / dprRef.current
    const height = canvas.height / dprRef.current

    ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0)
    drawPaper(ctx, width, height)

    for (const stroke of strokesRef.current) {
      drawStroke(ctx, stroke)
    }
  }, [])

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1))
    dprRef.current = dpr

    const saved = strokesRef.current
    canvas.width = Math.max(1, Math.floor(rect.width * dpr))
    canvas.height = Math.max(1, Math.floor(rect.height * dpr))
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    strokesRef.current = saved
    redraw()
  }, [redraw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => setupCanvas())
    observer.observe(canvas)
    setupCanvas()
    return () => observer.disconnect()
  }, [setupCanvas])

  const getPoint = useCallback((e: PointerEvent | React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0, pressure: 0.5 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure && e.pressure > 0 ? e.pressure : 0.5,
    }
  }, [])

  const drawIncrement = useCallback((stroke: Stroke) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const len = stroke.points.length
    if (len < 2) return

    const prev = stroke.points[len - 2]
    const curr = stroke.points[len - 1]

    ctx.save()
    ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = '#000'
      ctx.shadowBlur = 0
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = stroke.color
      ctx.shadowColor = stroke.tool === 'ink' ? stroke.color : 'transparent'
      ctx.shadowBlur = stroke.tool === 'ink' ? 5 : 0
    }

    ctx.lineWidth = Math.max(1, stroke.size * curr.pressure)
    ctx.beginPath()

    if (len > 2) {
      const before = stroke.points[len - 3]
      const midPrevX = (before.x + prev.x) / 2
      const midPrevY = (before.y + prev.y) / 2
      const midCurrX = (prev.x + curr.x) / 2
      const midCurrY = (prev.y + curr.y) / 2
      ctx.moveTo(midPrevX, midPrevY)
      ctx.quadraticCurveTo(prev.x, prev.y, midCurrX, midCurrY)
    } else {
      ctx.moveTo(prev.x, prev.y)
      ctx.lineTo(curr.x, curr.y)
    }

    ctx.stroke()
    ctx.restore()
  }, [])

  const setCurrentTool = useCallback((tool: DrawingTool) => {
    setActiveTool(tool)
    setBrushSize((prev) => {
      if (prev > 0) return prev
      return TOOL_DEFAULTS[tool]
    })
  }, [])

  const start = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    e.preventDefault()
    canvas.setPointerCapture(e.pointerId)
    pointerIdRef.current = e.pointerId

    const first = getPoint(e)
    currentStrokeRef.current = {
      id: crypto.randomUUID(),
      points: [first],
      color,
      size: brushSize,
      tool: activeTool,
    }

    isDrawingRef.current = true
    redoRef.current = []
  }, [activeTool, brushSize, color, getPoint])

  const draw = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return
    e.preventDefault()

    const native = e.nativeEvent
    const events = typeof native.getCoalescedEvents === 'function' ? native.getCoalescedEvents() : [native]

    for (const event of events) {
      const point = getPoint(event)
      currentStrokeRef.current.points.push(point)
      drawIncrement(currentStrokeRef.current)
    }
  }, [drawIncrement, getPoint])

  const stop = useCallback((e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return

    const canvas = canvasRef.current
    if (canvas && e && pointerIdRef.current !== null) {
      try {
        canvas.releasePointerCapture(pointerIdRef.current)
      } catch {
        // ignore release errors
      }
    }

    isDrawingRef.current = false
    pointerIdRef.current = null

    strokesRef.current = [...strokesRef.current, currentStrokeRef.current]
    currentStrokeRef.current = null
    flush()
  }, [flush])

  const clear = useCallback(() => {
    if (strokesRef.current.length === 0) return false
    if (!window.confirm('¿Limpiar la hoja?')) return false
    strokesRef.current = []
    redoRef.current = []
    currentStrokeRef.current = null
    redraw()
    flush()
    return true
  }, [flush, redraw])

  const undo = useCallback(() => {
    if (!strokesRef.current.length) return
    const last = strokesRef.current[strokesRef.current.length - 1]
    strokesRef.current = strokesRef.current.slice(0, -1)
    redoRef.current = [...redoRef.current, last]
    redraw()
    flush()
  }, [flush, redraw])

  const redo = useCallback(() => {
    if (!redoRef.current.length) return
    const restore = redoRef.current[redoRef.current.length - 1]
    redoRef.current = redoRef.current.slice(0, -1)
    strokesRef.current = [...strokesRef.current, restore]
    redraw()
    flush()
  }, [flush, redraw])

  const exportPngBlob = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return null

    return await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png')
    })
  }, [])

  const exportWebpBlob = useCallback(async (maxSize: number, quality = 0.88) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const sourceWidth = canvas.width / dprRef.current
    const sourceHeight = canvas.height / dprRef.current
    const ratio = Math.min(1, maxSize / Math.max(sourceWidth, sourceHeight))
    const width = Math.max(1, Math.round(sourceWidth * ratio))
    const height = Math.max(1, Math.round(sourceHeight * ratio))

    const offscreen = document.createElement('canvas')
    offscreen.width = width
    offscreen.height = height

    const ctx = offscreen.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(canvas, 0, 0, width, height)

    return await new Promise<Blob | null>((resolve) => {
      offscreen.toBlob((blob) => resolve(blob), 'image/webp', quality)
    })
  }, [])

  const loadStrokes = useCallback((strokes: Stroke[]) => {
    strokesRef.current = Array.isArray(strokes) ? strokes : []
    redoRef.current = []
    redraw()
    flush()
  }, [flush, redraw])

  const exportImage = useCallback(() => canvasRef.current?.toDataURL('image/png', 0.94), [])

  const compatibilityTool = (activeTool === 'eraser' ? 'pencil' : activeTool) as 'pencil' | 'marker' | 'ink'

  return useMemo(() => ({
    canvasRef,
    strokes: strokesRef.current,
    canUndo: strokesRef.current.length > 0,
    canRedo: redoRef.current.length > 0,
    hasContent: strokesRef.current.length > 0,
    color,
    setColor,
    currentTool: compatibilityTool,
    activeTool,
    setCurrentTool,
    brushSize,
    setBrushSize,
    start,
    draw,
    stop,
    clear,
    undo,
    redo,
    exportPngBlob,
    exportImage,
    strokeCount: strokesRef.current.length,
    exportWebpBlob,
    loadStrokes,
  }), [
    activeTool,
    brushSize,
    clear,
    compatibilityTool,
    color,
    draw,
    exportImage,
    exportPngBlob,
    exportWebpBlob,
    loadStrokes,
    redo,
    setColor,
    setCurrentTool,
    start,
    stop,
    undo,
  ])
}
