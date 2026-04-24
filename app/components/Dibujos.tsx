'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type Brush = 'pencil' | 'marker' | 'neon' | 'airbrush' | 'eraser'
type Point = { x: number; y: number; pressure: number }
type Stroke = { brush: Brush; color: string; size: number; opacity: number; points: Point[] }
type SavedDrawing = { id: string; title: string; createdAt: string; dataUrl: string; strokes: number }

const STORAGE_KEY = 'mmtza-drawings-v1'
const MAX_ITEMS = 24
const PALETTE = ['#f2f0ff', '#8b5cf6', '#22d3ee', '#f43f5e', '#84cc16', '#f59e0b']

export const Dibujos: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [brush, setBrush] = useState<Brush>('pencil')
  const [color, setColor] = useState('#8b5cf6')
  const [size, setSize] = useState(5)
  const [opacity, setOpacity] = useState(0.9)
  const [title, setTitle] = useState('Sin título')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState<SavedDrawing[]>([])
  const strokesRef = useRef<Stroke[]>([])
  const redoRef = useRef<Stroke[]>([])
  const currentRef = useRef<Stroke | null>(null)

  const loadSaved = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as SavedDrawing[]
      setSaved(parsed)
    } catch {
      setError('No pudimos leer el museo local.')
    }
  }, [])

  const persistSaved = useCallback((items: SavedDrawing[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
      setSaved(items.slice(0, MAX_ITEMS))
      setError('')
    } catch {
      setError('Almacenamiento lleno. Borra algunos dibujos para continuar.')
    }
  }, [])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.clientWidth
    const h = canvas.clientHeight

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#05060d'
    ctx.fillRect(0, 0, w, h)

    for (const stroke of strokesRef.current) {
      if (stroke.points.length < 2) continue
      ctx.save()
      ctx.globalAlpha = stroke.opacity
      ctx.globalCompositeOperation = stroke.brush === 'eraser' ? 'destination-out' : 'source-over'
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.size
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.shadowBlur = stroke.brush === 'neon' ? stroke.size * 1.5 : stroke.brush === 'airbrush' ? stroke.size : 0
      ctx.shadowColor = stroke.color

      ctx.beginPath()
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
      for (let i = 1; i < stroke.points.length; i++) {
        const p = stroke.points[i]
        const prev = stroke.points[i - 1]
        const mx = (p.x + prev.x) * 0.5
        const my = (p.y + prev.y) * 0.5
        ctx.quadraticCurveTo(prev.x, prev.y, mx, my)
      }
      ctx.stroke()

      if (stroke.brush === 'airbrush') {
        for (const p of stroke.points) {
          ctx.fillStyle = stroke.color
          ctx.globalAlpha = stroke.opacity * 0.05
          ctx.beginPath()
          ctx.arc(p.x + (Math.random() - 0.5) * stroke.size, p.y + (Math.random() - 0.5) * stroke.size, stroke.size * 0.6, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.restore()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      redraw()
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
    loadSaved()
    return () => observer.disconnect()
  }, [loadSaved, redraw])

  const normalize = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5,
    }
  }

  const activeBrushSize = useMemo(() => {
    if (brush === 'marker') return size * 1.6
    if (brush === 'neon') return size * 1.2
    if (brush === 'airbrush') return size * 2
    if (brush === 'eraser') return size * 2.2
    return size
  }, [brush, size])

  const onStart = (e: React.PointerEvent<HTMLCanvasElement>) => {
    ;(e.target as Element).setPointerCapture(e.pointerId)
    const p = normalize(e)
    currentRef.current = {
      brush,
      color: brush === 'eraser' ? '#000000' : color,
      size: activeBrushSize * (0.7 + p.pressure * 0.6),
      opacity,
      points: [p],
    }
    redoRef.current = []
  }

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!currentRef.current) return
    currentRef.current.points.push(normalize(e))
    const temp = [...strokesRef.current, currentRef.current]
    strokesRef.current = temp
    redraw()
    strokesRef.current = temp.slice(0, -1)
  }

  const onEnd = () => {
    if (!currentRef.current) return
    if (currentRef.current.points.length > 1) {
      strokesRef.current.push(currentRef.current)
    }
    currentRef.current = null
    redraw()
  }

  const undo = () => {
    const popped = strokesRef.current.pop()
    if (popped) redoRef.current.push(popped)
    redraw()
  }

  const redo = () => {
    const restored = redoRef.current.pop()
    if (restored) strokesRef.current.push(restored)
    redraw()
  }

  const clear = () => {
    strokesRef.current = []
    redoRef.current = []
    redraw()
  }

  const exportPNG = () => {
    const url = canvasRef.current?.toDataURL('image/png', 0.92)
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `dibujo-${Date.now()}.png`
    a.click()
  }

  const hangDrawing = () => {
    const url = canvasRef.current?.toDataURL('image/png', 0.88)
    if (!url) return
    const next: SavedDrawing[] = [
      {
        id: crypto.randomUUID(),
        title: title.trim() || 'Sin título',
        createdAt: new Date().toISOString(),
        dataUrl: url,
        strokes: strokesRef.current.length,
      },
      ...saved,
    ]
    persistSaved(next)
  }

  const removeDrawing = (id: string) => {
    persistSaved(saved.filter((item) => item.id !== id))
  }

  return (
    <section id="dibujos" className="section py-24 border-t border-[var(--line)]">
      <div className="max-w-[1240px] mx-auto px-6 md:px-12 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="font-mono text-[11px] tracking-[0.28em] uppercase text-[var(--accent)] mb-3">Dibujos</div>
          <h2 className="fluid-h2 text-[var(--fg)] mb-4">Lienzo vivo · Museo local</h2>
          <p className="text-[var(--fg-muted)] mb-6 max-w-[58ch]">Dibuja, exporta y cuelga tu pieza. Se guarda en este navegador para formar tu pequeño museo personal.</p>

          <div className="surface p-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {(['pencil', 'marker', 'neon', 'airbrush', 'eraser'] as Brush[]).map((id) => (
                <button key={id} onClick={() => setBrush(id)} className={`btn btn-ghost !px-3 !py-2 ${brush === id ? '!border-[var(--accent)] text-[var(--accent)]' : ''}`}>{id}</button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {PALETTE.map((swatch) => (
                <button key={swatch} onClick={() => setColor(swatch)} style={{ backgroundColor: swatch }} className="h-7 w-7 rounded-full border border-white/20" aria-label={swatch} />
              ))}
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-10 bg-transparent" aria-label="Color personalizado" />
              <label className="text-xs text-[var(--fg-muted)]">Tamaño <input type="range" min={1} max={24} value={size} onChange={(e) => setSize(Number(e.target.value))} /></label>
              <label className="text-xs text-[var(--fg-muted)]">Opacidad <input type="range" min={0.1} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} /></label>
            </div>

            <canvas
              ref={canvasRef}
              className="w-full h-[340px] md:h-[420px] rounded-xl border border-[var(--line)] touch-none"
              onPointerDown={onStart}
              onPointerMove={onMove}
              onPointerUp={onEnd}
              onPointerCancel={onEnd}
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn btn-ghost !px-3 !py-2" onClick={undo}>Undo</button>
              <button className="btn btn-ghost !px-3 !py-2" onClick={redo}>Redo</button>
              <button className="btn btn-ghost !px-3 !py-2" onClick={clear}>Clear</button>
              <button className="btn btn-ghost !px-3 !py-2" onClick={exportPNG}>Export PNG</button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <input className="form-input !text-base" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título del dibujo" />
              <button className="btn btn-primary" onClick={hangDrawing}>Colgar dibujo</button>
            </div>
            {error && <p className="text-sm text-rose-400 mt-2">{error}</p>}
          </div>
        </div>

        <div className="lg:col-span-5">
          <h3 className="font-display text-3xl mb-4">Museo</h3>
          {saved.length === 0 ? (
            <div className="surface p-6 text-[var(--fg-muted)]">Aún no hay dibujos colgados. Tu próxima pieza puede inaugurar la sala.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {saved.map((item) => (
                <article key={item.id} className="surface p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.dataUrl} alt={item.title} loading="lazy" className="w-full h-32 object-cover rounded-lg border border-[var(--line)]" />
                  <div className="mt-2 text-sm text-[var(--fg)] truncate">{item.title}</div>
                  <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--fg-muted)]">{new Date(item.createdAt).toLocaleDateString()} · {item.strokes} strokes</div>
                  <button className="link-underline text-xs mt-2 text-[var(--fg-muted)]" onClick={() => removeDrawing(item.id)}>Eliminar local</button>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
