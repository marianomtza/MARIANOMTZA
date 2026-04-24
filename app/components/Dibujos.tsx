'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type Brush = 'pencil' | 'marker' | 'neon' | 'eraser' | 'airbrush'

type Pt = { x: number; y: number; p: number }
type Stroke = {
  brush: Brush
  color: string
  size: number
  opacity: number
  points: Pt[]
}

const PALETTE = ['#111111', '#9b5fd6', '#c026d3', '#0ea5e9', '#22c55e', '#f97316', '#ffffff']

export function Dibujos() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const drawingRef = useRef(false)
  const currentRef = useRef<Stroke | null>(null)
  const strokesRef = useRef<Stroke[]>([])
  const redoRef = useRef<Stroke[]>([])
  const rafRef = useRef<number | null>(null)
  const dprRef = useRef(1)

  const [brush, setBrush] = useState<Brush>('pencil')
  const [color, setColor] = useState('#111111')
  const [size, setSize] = useState(5)
  const [opacity, setOpacity] = useState(0.9)
  const [version, setVersion] = useState(0)

  const canUndo = strokesRef.current.length > 0
  const canRedo = redoRef.current.length > 0

  const brushStyle = useMemo(
    () => ({
      pencil: { lineCap: 'round' as const, blur: 0, alpha: opacity },
      marker: { lineCap: 'round' as const, blur: 0, alpha: Math.min(0.45, opacity) },
      neon: { lineCap: 'round' as const, blur: 10, alpha: Math.min(0.9, opacity) },
      eraser: { lineCap: 'round' as const, blur: 0, alpha: 1 },
      airbrush: { lineCap: 'round' as const, blur: 14, alpha: Math.min(0.35, opacity) },
    }),
    [opacity]
  )

  const paintPaper = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = '#f7f4ef'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(17,17,17,0.035)'
    ctx.lineWidth = 0.45
    for (let x = 10; x < w; x += 12) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + ((x % 5) - 2) * 0.4, h)
      ctx.stroke()
    }
  }, [])

  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 1) return
    const style = brushStyle[stroke.brush]
    const baseColor = stroke.brush === 'eraser' ? '#f7f4ef' : stroke.color
    ctx.save()
    ctx.lineCap = style.lineCap
    ctx.lineJoin = 'round'
    ctx.globalAlpha = style.alpha * stroke.opacity
    ctx.strokeStyle = baseColor
    ctx.shadowColor = baseColor
    ctx.shadowBlur = style.blur

    if (stroke.brush === 'airbrush') {
      for (const p of stroke.points) {
        const r = Math.max(1, stroke.size * (0.35 + p.p * 0.75))
        ctx.beginPath()
        ctx.fillStyle = baseColor
        ctx.globalAlpha = 0.06 + p.p * 0.08
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
      return
    }

    ctx.beginPath()
    const first = stroke.points[0]
    ctx.moveTo(first.x, first.y)
    for (let i = 1; i < stroke.points.length; i += 1) {
      const a = stroke.points[i - 1]
      const b = stroke.points[i]
      const mx = (a.x + b.x) * 0.5
      const my = (a.y + b.y) * 0.5
      ctx.lineWidth = Math.max(1, stroke.size * (0.35 + b.p * 0.8))
      ctx.quadraticCurveTo(a.x, a.y, mx, my)
    }
    ctx.stroke()
    ctx.restore()
  }, [brushStyle])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { desynchronized: true })
    if (!ctx) return
    const w = canvas.width / dprRef.current
    const h = canvas.height / dprRef.current
    ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0)
    paintPaper(ctx, w, h)
    for (const stroke of strokesRef.current) drawStroke(ctx, stroke)
    if (currentRef.current) drawStroke(ctx, currentRef.current)
  }, [drawStroke, paintPaper])

  const requestRedraw = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      redraw()
    })
  }, [redraw])

  const setup = useCallback(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    dprRef.current = Math.max(1, Math.min(window.devicePixelRatio || 1, 2))
    const rect = wrap.getBoundingClientRect()
    canvas.width = Math.floor(rect.width * dprRef.current)
    canvas.height = Math.floor(rect.height * dprRef.current)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    redraw()
  }, [redraw])

  useEffect(() => {
    setup()
    const ro = new ResizeObserver(setup)
    if (wrapRef.current) ro.observe(wrapRef.current)
    return () => {
      ro.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [setup])

  const pointFrom = (e: React.PointerEvent<HTMLCanvasElement>): Pt => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top, p: Math.max(0.2, e.pressure || 0.5) }
  }

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drawingRef.current = true
    redoRef.current = []
    currentRef.current = { brush, color, size, opacity, points: [pointFrom(e)] }
    requestRedraw()
  }

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !currentRef.current) return
    currentRef.current.points.push(pointFrom(e))
    requestRedraw()
  }

  const end = () => {
    if (!drawingRef.current || !currentRef.current) return
    drawingRef.current = false
    if (currentRef.current.points.length > 1) strokesRef.current.push(currentRef.current)
    currentRef.current = null
    setVersion((v) => v + 1)
    requestRedraw()
  }

  const clear = () => {
    strokesRef.current = []
    redoRef.current = []
    currentRef.current = null
    setVersion((v) => v + 1)
    requestRedraw()
  }

  const undo = () => {
    const stroke = strokesRef.current.pop()
    if (stroke) redoRef.current.push(stroke)
    setVersion((v) => v + 1)
    requestRedraw()
  }

  const redo = () => {
    const stroke = redoRef.current.pop()
    if (stroke) strokesRef.current.push(stroke)
    setVersion((v) => v + 1)
    requestRedraw()
  }

  const download = () => {
    const url = canvasRef.current?.toDataURL('image/png', 0.95)
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `marianomtza-dibujo-${Date.now()}.png`
    a.click()
  }

  return (
    <section id="dibujos" className="py-24 px-6 md:px-12 border-t border-[var(--line)]">
      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-[320px_1fr] gap-6">
        <aside className="glass rounded-2xl p-4 space-y-4">
          <h3 className="font-display text-3xl">Dibujos</h3>
          <p className="text-sm text-[var(--fg-muted)]">Pointer + presión, suave en móvil y desktop.</p>
          <div className="grid grid-cols-3 gap-2">
            {(['pencil', 'marker', 'neon', 'airbrush', 'eraser'] as Brush[]).map((b) => (
              <button
                key={b}
                type="button"
                className={`px-2 py-2 rounded-lg text-xs uppercase tracking-wider border ${brush === b ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--line)]'}`}
                onClick={() => setBrush(b)}
              >
                {b}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button key={c} aria-label={`Color ${c}`} className="h-7 w-7 rounded-full border border-[var(--line)]" style={{ background: c }} onClick={() => setColor(c)} />
            ))}
            <input aria-label="Color personalizado" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-7 w-9" />
          </div>
          <label className="text-xs">Tamaño {size}px</label>
          <input type="range" min={1} max={36} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full" />
          <label className="text-xs">Opacidad {Math.round(opacity * 100)}%</label>
          <input type="range" min={0.1} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full" />
          <div className="flex flex-wrap gap-2 pt-2">
            <button className="btn btn-ghost" onClick={undo} disabled={!canUndo}>Undo</button>
            <button className="btn btn-ghost" onClick={redo} disabled={!canRedo}>Redo</button>
            <button className="btn btn-ghost" onClick={clear}>Limpiar</button>
            <button className="btn btn-primary" onClick={download}>Guardar PNG</button>
          </div>
          <div className="font-mono text-[10px] text-[var(--fg-muted)] tracking-[0.2em] uppercase">Trazos {strokesRef.current.length} · v{version}</div>
        </aside>

        <div ref={wrapRef} className="relative h-[62vh] min-h-[420px] rounded-2xl border border-[var(--line)] overflow-hidden bg-[#f7f4ef]">
          <canvas
            ref={canvasRef}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            onPointerLeave={end}
            className="h-full w-full touch-none cursor-crosshair"
            aria-label="Lienzo de dibujos"
          />
        </div>
      </div>
    </section>
  )
}
