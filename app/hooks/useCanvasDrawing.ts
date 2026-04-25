'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import type { DraftStroke, DraftData, DrawingTool } from '../lib/types'
import { saveDraft, readDraft, clearDraft } from '../lib/drawings'

// ─── Public constants ─────────────────────────────────────────────────────────

export const TOOLS: { id: DrawingTool; label: string; icon: string }[] = [
  { id: 'pencil',  label: 'LÁPIZ',    icon: '✎' },
  { id: 'marker',  label: 'MARCADOR', icon: '▬' },
  { id: 'ink',     label: 'TINTA',    icon: '≈' },
  { id: 'eraser',  label: 'BORRADOR', icon: '◻' },
]

/** 5 quick-select colors. No white — use the Eraser tool to erase. */
export const BASE_COLORS = [
  '#111111', // Negro tinta
  '#8B5CF6', // Morado MMTZA
  '#3772FF', // Azul eléctrico
  '#DF2935', // Rojo señal
  '#FDCA40', // Amarillo señal
] as const

// ─── Private constants ────────────────────────────────────────────────────────

const DPR_CAP     = 2
const AUTOSAVE_MS = 2000

// ─── Tool defaults ────────────────────────────────────────────────────────────

function defaultSize(tool: DrawingTool): number {
  switch (tool) {
    case 'pencil':  return 2.5
    case 'marker':  return 9
    case 'ink':     return 5
    case 'eraser':  return 22
  }
}

function toolOpacity(tool: DrawingTool): number {
  switch (tool) {
    case 'pencil':  return 0.82
    case 'marker':  return 0.88
    case 'ink':     return 0.95
    case 'eraser':  return 1
  }
}

// ─── Internal types ───────────────────────────────────────────────────────────

type Stroke = DraftStroke

// ─── Public interface ─────────────────────────────────────────────────────────

export interface UseCanvasDrawingReturn {
  canvasRef:       React.RefObject<HTMLCanvasElement>
  activeTool:      DrawingTool
  setActiveTool:   (t: DrawingTool) => void
  color:           string
  setColor:        (c: string) => void
  size:            number
  setSize:         (s: number) => void
  strokeCount:     number
  isDrawing:       boolean
  onPointerDown:   (e: React.PointerEvent<HTMLCanvasElement>) => void
  onPointerMove:   (e: React.PointerEvent<HTMLCanvasElement>) => void
  onPointerUp:     (e: React.PointerEvent<HTMLCanvasElement>) => void
  onPointerCancel: (e: React.PointerEvent<HTMLCanvasElement>) => void
  undo:            () => void
  redo:            () => void
  clear:           () => void
  exportPng:       () => string | null
  exportWebpBlob:  (maxDim?: number, quality?: number) => Promise<Blob | null>
  hasDraft:        boolean
  restoreDraft:    () => void
  discardDraft:    () => void
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCanvasDrawing(): UseCanvasDrawingReturn {
  const [activeTool,  setActiveToolState] = useState<DrawingTool>('pencil')
  const [color,       setColor]           = useState<string>(BASE_COLORS[0])
  const [size,        setSize]            = useState(defaultSize('pencil'))
  const [isDrawing,   setIsDrawing]       = useState(false)
  const [strokeCount, setStrokeCount]     = useState(0)
  const [hasDraft,    setHasDraft]        = useState(false)

  const canvasRef      = useRef<HTMLCanvasElement>(null)
  const strokesRef     = useRef<Stroke[]>([])
  const redoRef        = useRef<Stroke[]>([])
  const currentRef     = useRef<Stroke | null>(null)
  const autosaveTimer  = useRef<ReturnType<typeof setInterval> | null>(null)

  // Mutable refs so event handlers always see latest values without stale closures
  const activeToolRef  = useRef(activeTool)
  const colorRef       = useRef(color)
  const sizeRef        = useRef(size)

  useEffect(() => { activeToolRef.current = activeTool }, [activeTool])
  useEffect(() => { colorRef.current      = color      }, [color])
  useEffect(() => { sizeRef.current       = size       }, [size])

  // Sync size to tool default when tool changes
  const setActiveTool = useCallback((t: DrawingTool) => {
    setActiveToolState(t)
    setSize(defaultSize(t))
  }, [])

  // ── Context accessor ────────────────────────────────────────────────────────
  function getCtx(): CanvasRenderingContext2D | null {
    return canvasRef.current?.getContext('2d', { alpha: true }) ?? null
  }

  // ── Apply stroke style to context ───────────────────────────────────────────
  function applyStyle(ctx: CanvasRenderingContext2D, stroke: Stroke) {
    if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha  = stroke.opacity
      ctx.strokeStyle  = stroke.color
    }
    ctx.lineWidth  = stroke.size
    ctx.lineCap    = 'round'
    ctx.lineJoin   = 'round'
    ctx.shadowBlur  = stroke.tool === 'ink' ? 6 : stroke.tool === 'marker' ? 1 : 0
    ctx.shadowColor = stroke.color
  }

  // ── Draw one completed stroke (used only in redraw) ─────────────────────────
  function replayStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
    const pts = stroke.points
    if (pts.length < 2) return

    applyStyle(ctx, stroke)
    ctx.beginPath()
    ctx.moveTo(pts[0].x, pts[0].y)

    for (let i = 1; i < pts.length; i++) {
      if (i > 1) {
        const prev = pts[i - 1]
        const curr = pts[i]
        ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + curr.x) / 2, (prev.y + curr.y) / 2)
      } else {
        ctx.lineTo(pts[i].x, pts[i].y)
      }
    }
    ctx.stroke()

    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.shadowBlur  = 0
  }

  // ── Full redraw (undo / redo / resize / restore draft) ──────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx    = getCtx()
    if (!canvas || !ctx) return

    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (const stroke of strokesRef.current) replayStroke(ctx, stroke)

    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.shadowBlur  = 0
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Setup canvas — safe to call multiple times ───────────────────────────────
  //
  // canvas.width = w  resets the entire context state (per spec), so we must
  // re-apply the DPR transform after every resize.  We use setTransform (absolute)
  // instead of scale (cumulative) as a safety measure in case the browser ever
  // returns the same dimensions without a full reset.
  const setup = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const dpr  = Math.min(window.devicePixelRatio || 1, DPR_CAP)
    const w    = Math.floor(rect.width  * dpr)
    const h    = Math.floor(rect.height * dpr)

    // Dimensions unchanged → only redraw (context transform already set)
    if (canvas.width === w && canvas.height === h) {
      redraw()
      return
    }

    // Assigning canvas.width resets all context state including transforms
    canvas.width        = w
    canvas.height       = h
    canvas.style.width  = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = getCtx()
    if (!ctx) return

    // Absolute transform — safe if called multiple times
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    redraw()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redraw])

  // ── Mount: check draft + observe resize ─────────────────────────────────────
  useEffect(() => {
    const draft = readDraft()
    if (draft && draft.strokes.length > 0) setHasDraft(true)

    const canvas = canvasRef.current
    if (!canvas) return

    const ro = new ResizeObserver(() => setup())
    ro.observe(canvas)
    const t = setTimeout(setup, 60)

    return () => {
      ro.disconnect()
      clearTimeout(t)
    }
  }, [setup])

  // ── Autosave draft every 2 s ─────────────────────────────────────────────────
  useEffect(() => {
    autosaveTimer.current = setInterval(() => {
      if (!strokesRef.current.length) return
      const data: DraftData = {
        strokes:  strokesRef.current,
        color:    colorRef.current,
        tool:     activeToolRef.current,
        size:     sizeRef.current,
        savedAt:  Date.now(),
      }
      saveDraft(data)
      setHasDraft(true)
    }, AUTOSAVE_MS)

    return () => {
      if (autosaveTimer.current) clearInterval(autosaveTimer.current)
    }
  }, [])

  // ── Pointer handlers ─────────────────────────────────────────────────────────

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      const ctx    = getCtx()
      if (!canvas || !ctx) return

      e.currentTarget.setPointerCapture(e.pointerId)
      setIsDrawing(true)
      redoRef.current = [] // new stroke clears redo stack

      const rect     = canvas.getBoundingClientRect()
      const pt       = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      const tool     = activeToolRef.current
      const pressure = tool === 'eraser' ? 1 : (e.pressure > 0 ? e.pressure : 0.6)

      const stroke: Stroke = {
        points:  [pt],
        color:   colorRef.current,
        size:    sizeRef.current * (tool === 'eraser' ? 1 : 0.6 + pressure * 0.5),
        tool,
        opacity: toolOpacity(tool),
      }
      currentRef.current = stroke

      applyStyle(ctx, stroke)
      ctx.beginPath()
      ctx.moveTo(pt.x, pt.y)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !currentRef.current) return
      const ctx = getCtx()
      if (!ctx) return

      // Cache rect once per event — avoid double layout reflow
      const rect   = canvasRef.current!.getBoundingClientRect()
      const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent]

      for (const ev of events) {
        const pt   = { x: ev.clientX - rect.left, y: ev.clientY - rect.top }
        const pts  = currentRef.current.points
        const prev = pts[pts.length - 1]
        if (!prev) continue

        let dx = pt.x, dy = pt.y
        if (currentRef.current.tool === 'pencil') {
          dx += (Math.random() - 0.5) * 0.6
          dy += (Math.random() - 0.5) * 0.6
        }

        const mx = (prev.x + dx) / 2
        const my = (prev.y + dy) / 2

        if (pts.length > 1) {
          ctx.quadraticCurveTo(prev.x, prev.y, mx, my)
        } else {
          ctx.lineTo(dx, dy)
        }
        ctx.stroke()

        // Ink bleed pass
        if (currentRef.current.tool === 'ink') {
          const saved = ctx.globalAlpha
          ctx.save()
          ctx.globalAlpha = 0.07
          ctx.lineWidth   = currentRef.current.size * 1.8
          ctx.shadowBlur  = 10
          ctx.lineTo(dx + (Math.random() - 0.5) * 2, dy + (Math.random() - 0.5) * 2)
          ctx.stroke()
          ctx.restore()
          ctx.globalAlpha = saved
          ctx.lineWidth   = currentRef.current.size
          ctx.shadowBlur  = 6
        }

        // Advance path from midpoint so quadratic smoothing works next iteration
        ctx.beginPath()
        ctx.moveTo(mx, my)

        pts.push({ x: dx, y: dy })
      }
    },
    [isDrawing],
  )

  const finishStroke = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !currentRef.current) return

      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }

      const ctx = getCtx()
      if (ctx) {
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
        ctx.shadowBlur  = 0
      }

      const stroke = currentRef.current
      if (stroke.points.length >= 2) {
        strokesRef.current = [...strokesRef.current, stroke]
        setStrokeCount(c => c + 1)
      }
      currentRef.current = null
      setIsDrawing(false)
    },
    [isDrawing],
  )

  const onPointerUp     = finishStroke
  const onPointerCancel = finishStroke

  // ── Undo / Redo ──────────────────────────────────────────────────────────────

  const undo = useCallback(() => {
    if (!strokesRef.current.length) return
    redoRef.current    = [...redoRef.current, strokesRef.current[strokesRef.current.length - 1]]
    strokesRef.current = strokesRef.current.slice(0, -1)
    setStrokeCount(c => Math.max(0, c - 1))
    redraw()
  }, [redraw])

  const redo = useCallback(() => {
    if (!redoRef.current.length) return
    strokesRef.current = [...strokesRef.current, redoRef.current[redoRef.current.length - 1]]
    redoRef.current    = redoRef.current.slice(0, -1)
    setStrokeCount(c => c + 1)
    redraw()
  }, [redraw])

  // ── Clear ────────────────────────────────────────────────────────────────────

  const clear = useCallback(() => {
    strokesRef.current = []
    redoRef.current    = []
    setStrokeCount(0)
    clearDraft()
    setHasDraft(false)
    redraw()
  }, [redraw])

  // ── Export ───────────────────────────────────────────────────────────────────

  const exportPng = useCallback((): string | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const off = document.createElement('canvas')
    off.width  = canvas.width
    off.height = canvas.height
    const oc   = off.getContext('2d')!
    oc.fillStyle = '#ffffff'
    oc.fillRect(0, 0, off.width, off.height)
    oc.drawImage(canvas, 0, 0)
    return off.toDataURL('image/png', 0.94)
  }, [])

  const exportWebpBlob = useCallback(
    async (maxDim = 1200, quality = 0.88): Promise<Blob | null> => {
      const canvas = canvasRef.current
      if (!canvas) return null

      const scale = Math.min(1, maxDim / Math.max(canvas.width, canvas.height))
      const dstW  = Math.round(canvas.width  * scale)
      const dstH  = Math.round(canvas.height * scale)

      const off = document.createElement('canvas')
      off.width  = dstW
      off.height = dstH
      const oc   = off.getContext('2d')!
      oc.fillStyle = '#ffffff'
      oc.fillRect(0, 0, dstW, dstH)
      oc.drawImage(canvas, 0, 0, dstW, dstH)

      return new Promise<Blob | null>(resolve =>
        off.toBlob(blob => resolve(blob), 'image/webp', quality),
      )
    },
    [],
  )

  // ── Draft ────────────────────────────────────────────────────────────────────

  const restoreDraft = useCallback(() => {
    const draft = readDraft()
    if (!draft || !draft.strokes.length) return
    strokesRef.current = draft.strokes
    setStrokeCount(draft.strokes.length)
    setColor(draft.color)
    setActiveToolState(draft.tool)
    setSize(draft.size)
    redraw()
    setHasDraft(false)
  }, [redraw])

  const discardDraft = useCallback(() => {
    clearDraft()
    setHasDraft(false)
  }, [])

  return {
    canvasRef,
    activeTool,
    setActiveTool,
    color,
    setColor,
    size,
    setSize,
    strokeCount,
    isDrawing,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    undo,
    redo,
    clear,
    exportPng,
    exportWebpBlob,
    hasDraft,
    restoreDraft,
    discardDraft,
  }
}
