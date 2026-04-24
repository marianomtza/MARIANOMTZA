'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useCanvasDrawing, COLORS, TOOLS } from '../../hooks/useCanvasDrawing'
import { fetchWithRetry } from '../../lib/fetchWithRetry'

type Drawing = {
  id: string
  image: string
  name: string
  message: string
  tool: 'pencil' | 'marker' | 'ink'
  created_at: string
}

const STORAGE_KEY = 'mmtza-local-drawings'

export function Dibujos() {
  const { canvasRef, start, draw, stop, clear, exportImage, undo, color, setColor, currentTool, setCurrentTool, strokeCount } = useCanvasDrawing()

  const [name, setName] = useState('Anónimo')
  const [message, setMessage] = useState('')
  const [drawings, setDrawings] = useState<Drawing[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const hasDrawing = strokeCount > 0
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine

  useEffect(() => {
    const local = localStorage.getItem(STORAGE_KEY)
    if (local) {
      try {
        setDrawings(JSON.parse(local) as Drawing[])
      } catch {
        setDrawings([])
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drawings.slice(0, 30)))
  }, [drawings])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        if (isOffline) return
        const response = await fetchWithRetry('/api/drawings?limit=24&offset=0', undefined, 1)
        if (!response.ok) throw new Error('No se pudo cargar el museo')
        const data = (await response.json()) as { drawings?: Drawing[] }
        if (data.drawings?.length) setDrawings(data.drawings)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error cargando dibujos'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [isOffline])

  const saveDrawing = async () => {
    setError('')
    const image = exportImage()

    if (!image || !hasDrawing) {
      setError('Haz un dibujo antes de guardarlo.')
      return
    }

    if (image.length > 1_900_000) {
      setError('El dibujo es demasiado grande. Intenta limpiar algunos trazos.')
      return
    }

    const payload = {
      image,
      name: name.trim() || 'Anónimo',
      message: message.trim(),
      tool: currentTool,
    }

    const localItem: Drawing = {
      id: crypto.randomUUID(),
      image,
      name: payload.name,
      message: payload.message,
      tool: currentTool,
      created_at: new Date().toISOString(),
    }

    setSaving(true)
    try {
      if (isOffline) {
        setDrawings((prev) => [localItem, ...prev])
        clear()
        return
      }

      const response = await fetchWithRetry('/api/drawings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error || 'No se pudo guardar')
      }

      const saved = (await response.json()) as Drawing
      setDrawings((prev) => [saved, ...prev])
      clear()
      setMessage('')
    } catch (err) {
      setDrawings((prev) => [localItem, ...prev])
      const message = err instanceof Error ? err.message : 'Error al guardar dibujo'
      setError(`${message}. Se guardó en este dispositivo.`)
      clear()
    } finally {
      setSaving(false)
    }
  }

  const emptyState = useMemo(
    () => (
      <div className="rounded-2xl border border-dashed border-[var(--line)] p-8 text-center text-[var(--fg-muted)]">
        Aún no hay piezas en el museo. Sé la primera señal nocturna.
      </div>
    ),
    []
  )

  return (
    <section id="dibujos" className="py-24 border-t border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[var(--accent)] mb-2">Museo persistente</p>
            <h2 className="font-display text-5xl">Dibujos</h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-8 rounded-2xl border border-[var(--line)] bg-[#f8f5f0] p-3">
            <canvas
              ref={canvasRef}
              className="w-full h-[360px] md:h-[460px] rounded-xl touch-none"
              onPointerDown={start}
              onPointerMove={draw}
              onPointerUp={stop}
              onPointerCancel={stop}
              onPointerLeave={stop}
            />
          </div>

          <aside className="lg:col-span-4 space-y-5">
            <div className="surface p-4 space-y-3">
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--fg-muted)]">Herramientas</p>
              <div className="grid grid-cols-3 gap-2">
                {TOOLS.map((tool) => (
                  <button key={tool.id} onClick={() => setCurrentTool(tool.id)} className={`btn ${currentTool === tool.id ? 'btn-primary' : 'btn-ghost'} !px-3 !py-2 min-h-11`}>
                    {tool.icon}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <label className="block font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--fg-muted)]" htmlFor="drawing-color-picker">
                  Color libre
                </label>
                <input
                  id="drawing-color-picker"
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  aria-label="Color libre"
                  className="h-11 w-full cursor-pointer rounded-md border border-[var(--line)] bg-transparent p-1"
                />
              </div>
              <div className="space-y-2">
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--fg-muted)]">Color rápido</p>
                <div className="grid grid-cols-6 gap-2">
                {COLORS.map((swatch) => (
                  <button
                    key={swatch}
                    onClick={() => setColor(swatch)}
                    className="min-h-11 rounded-full border transition-transform active:scale-95"
                    style={{ background: swatch, borderColor: color.toLowerCase() === swatch.toLowerCase() ? 'var(--accent)' : 'var(--line)' }}
                    aria-label={`Color rápido ${swatch}`}
                    title={swatch}
                  />
                ))}
              </div>
              </div>
              <button onClick={undo} className="btn btn-ghost min-h-11 w-full">Deshacer</button>
              <button onClick={clear} className="btn btn-ghost min-h-11 w-full">Limpiar</button>
            </div>

            <div className="surface p-4 space-y-3">
              <input value={name} onChange={(e) => setName(e.target.value)} className="form-input" maxLength={80} placeholder="Nombre" />
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="form-input min-h-[80px]" maxLength={220} placeholder="Mensaje breve" />
              <button onClick={saveDrawing} disabled={saving} className="btn btn-primary min-h-11 w-full disabled:opacity-70">
                {saving ? 'Guardando…' : 'Colgar en museo'}
              </button>
              <a href={exportImage() || '#'} download="mmtza-dibujo.png" className="btn btn-ghost min-h-11 w-full pointer-events-auto">Exportar PNG</a>
              {error && <p className="text-sm text-red-300">{error}</p>}
            </div>
          </aside>
        </div>

        {loading ? (
          <div className="text-[var(--fg-muted)]">Cargando museo…</div>
        ) : drawings.length === 0 ? (
          emptyState
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {drawings.map((drawing) => (
              <article key={drawing.id} className="surface p-3">
                <img src={drawing.image} alt={`Dibujo de ${drawing.name}`} className="w-full h-56 object-cover rounded-lg mb-3" />
                <div className="text-sm font-semibold">{drawing.name}</div>
                {drawing.message && <p className="text-sm text-[var(--fg-muted)] mt-1">{drawing.message}</p>}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
