'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { DrawingPoint, DrawingStroke, DrawingTool } from '../lib/drawings'

export const TOOLS: Array<{ id: DrawingTool; label: string; base: number }> = [
  { id: 'pencil', label: 'Lápiz', base: 0.55 },
  { id: 'marker', label: 'Marcador', base: 1.2 },
  { id: 'ink', label: 'Tinta', base: 0.9 },
  { id: 'eraser', label: 'Borrador', base: 1.5 },
]

export interface CanvasDrawingReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>
  onPointerDown: (event: ReactPointerEvent<HTMLCanvasElement>) => void
  onPointerMove: (event: ReactPointerEvent<HTMLCanvasElement>) => void
  onPointerUp: (event: ReactPointerEvent<HTMLCanvasElement>) => void
  onPointerCancel: (event: ReactPointerEvent<HTMLCanvasElement>) => void
  setTool: (tool: DrawingTool) => void
  setColor: (color: string) => void
  setBrushSize: (size: number) => void
  undo: () => void
  redo: () => void
  clear: () => void
  exportPng: () => void
  exportDataUrl: () => string | null
  exportBlob: (type?: string, quality?: number) => Promise<Blob | null>
  loadStrokes: (strokes: DrawingStroke[]) => void
  hasDrawing: boolean
  canUndo: boolean
  canRedo: boolean
  tool: DrawingTool
  color: string
  brushSize: number
  strokes: DrawingStroke[]
}

function generatePaperTexture(width: number, height: number) {
  const patternCanvas = document.createElement('canvas')
  patternCanvas.width = 96
  patternCanvas.height = 96
  const pctx = patternCanvas.getContext('2d')
  if (!pctx) return null

  pctx.fillStyle = '#f8f5f0'
  pctx.fillRect(0, 0, patternCanvas.width, patternCanvas.height)

  for (let i = 0; i < 140; i += 1) {
    const x = (i * 37) % 96
    const y = (i * 53) % 96
    const alpha = ((i % 9) + 1) / 180
    pctx.fillStyle = `rgba(90,65,40,${alpha.toFixed(3)})`
    pctx.fillRect(x, y, 1, 1)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const pattern = ctx.createPattern(patternCanvas, 'repeat')
  if (!pattern) return null

  ctx.fillStyle = pattern
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = 'rgba(20,20,20,0.035)'
  ctx.fillRect(0, 0, width, 1)
  ctx.fillRect(0, height - 1, width, 1)
  ctx.fillRect(0, 0, 1, height)
  ctx.fillRect(width - 1, 0, 1, height)

  return canvas
}

export function useCanvasDrawing(): CanvasDrawingReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerStrokeRef = useRef<DrawingStroke | null>(null)
  const paperTextureRef = useRef<HTMLCanvasElement | null>(null)

  const [tool, setTool] = useState<DrawingTool>('pencil')
  const [color, setColor] = useState('#111111')
  const [brushSize, setBrushSize] = useState(6)
  const [strokes, setStrokes] = useState<DrawingStroke[]>([])
  const [redoStack, setRedoStack] = useState<DrawingStroke[]>([])

  const getCtx = useCallback(() => canvasRef.current?.getContext('2d', { alpha: false, desynchronized: true }) ?? null, [])

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!paperTextureRef.current || paperTextureRef.current.width !== width || paperTextureRef.current.height !== height) {
      paperTextureRef.current = generatePaperTexture(width, height)
    }

    if (paperTextureRef.current) {
      ctx.drawImage(paperTextureRef.current, 0, 0)
    } else {
      ctx.fillStyle = '#f8f5f0'
      ctx.fillRect(0, 0, width, height)
    }
  }, [])

  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: DrawingStroke) => {
    if (stroke.points.length === 0) return
    ctx.save()
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
    ctx.globalAlpha = stroke.opacity
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.size
    ctx.shadowBlur = stroke.tool === 'ink' ? 4 : 0
    ctx.shadowColor = stroke.color

    const [first, ...rest] = stroke.points
    ctx.beginPath()
    ctx.moveTo(first.x, first.y)

    for (let i = 0; i < rest.length; i += 1) {
      const p = rest[i]
      const prev = i === 0 ? first : rest[i - 1]
      const midX = (prev.x + p.x) / 2
      const midY = (prev.y + p.y) / 2
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY)
    }

    ctx.lineTo(stroke.points[stroke.points.length - 1].x, stroke.points[stroke.points.length - 1].y)
    ctx.stroke()
    ctx.restore()
  }, [])

  const redraw = useCallback(
    (incoming?: DrawingStroke[]) => {
      const canvas = canvasRef.current
      const ctx = getCtx()
      if (!canvas || !ctx) return

      const width = canvas.width / (window.devicePixelRatio || 1)
      const height = canvas.height / (window.devicePixelRatio || 1)

      ctx.clearRect(0, 0, width, height)
      drawBackground(ctx, width, height)
      ;(incoming ?? strokes).forEach((stroke) => drawStroke(ctx, stroke))
      if (pointerStrokeRef.current) drawStroke(ctx, pointerStrokeRef.current)
    },
    [drawBackground, drawStroke, getCtx, strokes]
  )

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor(rect.height * dpr)

    const ctx = getCtx()
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    redraw()
  }, [getCtx, redraw])

  useEffect(() => {
    if (!canvasRef.current) return
    const ro = new ResizeObserver(() => setupCanvas())
    ro.observe(canvasRef.current)
    setupCanvas()
    return () => ro.disconnect()
  }, [setupCanvas])

  const getPoint = useCallback((event: PointerEvent | ReactPointerEvent<HTMLCanvasElement>): DrawingPoint => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const pressure = Math.max(('pressure' in event ? event.pressure : 0.5) || 0.5, 0.1)
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      pressure,
      t: Date.now(),
    }
  }, [])

  const appendPoints = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    const stroke = pointerStrokeRef.current
    if (!stroke) return

    const native = event.nativeEvent
    const coalesced = typeof native.getCoalescedEvents === 'function' ? native.getCoalescedEvents() : [native]
    coalesced.forEach((evt) => {
      stroke.points.push(getPoint(evt))
    })

    redraw()
  }, [getPoint, redraw])

  const finalizeStroke = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    const stroke = pointerStrokeRef.current
    if (!stroke) return

    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // noop
    }

    pointerStrokeRef.current = null
    if (stroke.points.length > 1) {
      setStrokes((prev) => {
        const next = [...prev, stroke]
        return next
      })
      setRedoStack([])
    }
  }, [])

  useEffect(() => {
    redraw()
  }, [strokes, redraw])

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)

    const point = getPoint(event)
    const toolMeta = TOOLS.find((item) => item.id === tool)
    const weight = (toolMeta?.base ?? 1) * brushSize
    pointerStrokeRef.current = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      tool,
      color: tool === 'eraser' ? '#000000' : color,
      size: Math.max(1, weight * Math.max(point.pressure, 0.25)),
      opacity: tool === 'marker' ? 0.46 : tool === 'ink' ? 0.92 : 1,
      points: [point],
    }

    redraw()
  }, [brushSize, color, getPoint, redraw, tool])

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!pointerStrokeRef.current) return
    appendPoints(event)
  }, [appendPoints])

  const onPointerUp = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!pointerStrokeRef.current) return
    appendPoints(event)
    finalizeStroke(event)
  }, [appendPoints, finalizeStroke])

  const onPointerCancel = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!pointerStrokeRef.current) return
    finalizeStroke(event)
  }, [finalizeStroke])

  const undo = useCallback(() => {
    setStrokes((prev) => {
      if (prev.length === 0) return prev
      const next = [...prev]
      const popped = next.pop()!
      setRedoStack((redo) => [...redo, popped])
      return next
    })
  }, [])

  const redo = useCallback(() => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev
      const next = [...prev]
      const stroke = next.pop()!
      setStrokes((st) => [...st, stroke])
      return next
    })
  }, [])

  const clear = useCallback(() => {
    setStrokes([])
    setRedoStack([])
    pointerStrokeRef.current = null
  }, [])

  const exportDataUrl = useCallback(() => {
    return canvasRef.current?.toDataURL('image/png') ?? null
  }, [])

  const exportPng = useCallback(() => {
    const data = exportDataUrl()
    if (!data) return
    const anchor = document.createElement('a')
    anchor.href = data
    anchor.download = `mmtza-dibujo-${Date.now()}.png`
    anchor.click()
  }, [exportDataUrl])

  const exportBlob = useCallback(async (type = 'image/webp', quality = 0.88) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), type, quality)
    })
  }, [])

  const loadStrokes = useCallback((incoming: DrawingStroke[]) => {
    setStrokes(incoming)
    setRedoStack([])
  }, [])

  return useMemo(
    () => ({
      canvasRef,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      setTool,
      setColor,
      setBrushSize,
      undo,
      redo,
      clear,
      exportPng,
      exportDataUrl,
      exportBlob,
      loadStrokes,
      hasDrawing: strokes.length > 0,
      canUndo: strokes.length > 0,
      canRedo: redoStack.length > 0,
      tool,
      color,
      brushSize,
      strokes,
    }),
    [
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      undo,
      redo,
      clear,
      exportPng,
      exportDataUrl,
      exportBlob,
      loadStrokes,
      strokes,
      redoStack.length,
      tool,
      color,
      brushSize,
    ]
  )
}
