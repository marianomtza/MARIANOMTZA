'use client'

import { useEffect, useState } from 'react'
import { COLORS, TOOLS, useCanvasDrawing } from '../../hooks/useCanvasDrawing'

type LocalDrawing = {
  id: string
  image: string
  name: string
  message: string
  tool: string
  created_at: string
}

const LOCAL_KEY = 'mmtza-local-drawings'
const DRAFT_KEY = 'mmtza-drawing-draft'

export function DrawingSection() {
  const {
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
    activeTool,
    setCurrentTool,
    size,
    setSize,
    strokeCount,
    strokes,
    setStrokes,
  } = useCanvasDrawing()

  const [name, setName] = useState('Anónimo')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [drawings, setDrawings] = useState<LocalDrawing[]>([])
  const [saving, setSaving] = useState(false)
  const [lightbox, setLightbox] = useState<LocalDrawing | null>(null)

  useEffect(() => {
    try {
      const local = localStorage.getItem(LOCAL_KEY)
      if (local) setDrawings(JSON.parse(local) as LocalDrawing[])

      const draft = localStorage.getItem(DRAFT_KEY)
      if (draft) {
        const parsed = JSON.parse(draft) as { strokes?: typeof strokes }
        if (parsed.strokes?.length) setStrokes(parsed.strokes)
      }
    } catch {
      setStatus('No se pudo restaurar el borrador local.')
    }
  }, [setStrokes])

  useEffect(() => {
    const id = window.setInterval(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ strokes }))
      } catch {
        setStatus('No se pudo guardar el borrador local.')
      }
    }, 2000)

    return () => window.clearInterval(id)
  }, [strokes])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(null)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleExport = () => {
    const image = exportImage()
    if (!image) return
    const a = document.createElement('a')
    a.href = image
    a.download = 'mmtza-dibujo.png'
    a.click()
    setStatus('PNG descargado.')
  }

  const saveDrawing = async () => {
    setStatus('')
    const image = exportImage()

    if (!image || strokeCount === 0) {
      setStatus('Primero dibuja algo.')
      return
    }

    setSaving(true)

    const payload = {
      image,
      name: name.trim() || 'Anónimo',
      message: message.trim(),
      tool: activeTool,
    }

    const formData = new FormData()
    formData.set('tool', activeTool)

    try {
      const response = await fetch('/api/drawings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('fallback')
      const saved = (await response.json()) as LocalDrawing
      setDrawings((prev) => [saved, ...prev].slice(0, 24))
      setStatus('Dibujo colgado.')
    } catch {
      const fallbackItem: LocalDrawing = {
        id: crypto.randomUUID(),
        image,
        name: payload.name,
        message: payload.message,
        tool: activeTool,
        created_at: new Date().toISOString(),
      }

      setDrawings((prev) => [fallbackItem, ...prev].slice(0, 24))
      setStatus('Sin conexión al servidor. Se guardó en este dispositivo.')
    } finally {
      setSaving(false)
      clear()
      try {
        localStorage.removeItem(DRAFT_KEY)
        localStorage.setItem(LOCAL_KEY, JSON.stringify(drawings.slice(0, 24)))
      } catch {
        setStatus('No se pudo persistir el dibujo localmente.')
      }
      void formData
    }
  }

  return (
    <section id="drawing-wall" className="border-t border-[var(--line)] py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--accent)]">PARED ABIERTA</p>
        <h2 className="font-display text-5xl">DEJA TU DIBUJO</h2>
        <p className="mt-3 text-[var(--fg-muted)]">No acepto reseñas, ni opiniones, solo dibujitos.</p>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <div className="rounded-2xl border border-[var(--line)] bg-[#f8f5f0] p-3 lg:col-span-8">
            <canvas
              ref={canvasRef}
              aria-label="Área para dibujar"
              className="h-[360px] w-full touch-none rounded-xl md:h-[460px]"
              style={{ touchAction: 'none' }}
              onPointerDown={start}
              onPointerMove={draw}
              onPointerUp={stop}
              onPointerCancel={stop}
            />
          </div>

          <aside className="space-y-5 lg:col-span-4">
            <div className="surface space-y-4 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--fg-muted)]">Herramienta</p>
              <div className="grid grid-cols-4 gap-2">
                {TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setCurrentTool(tool.id)}
                    className={`btn min-h-11 !px-3 !py-2 ${activeTool === tool.id ? 'btn-primary' : 'btn-ghost'}`}
                    aria-label={tool.label}
                  >
                    {tool.label}
                  </button>
                ))}
              </div>

              <label htmlFor="drawing-size" className="form-label">Tamaño</label>
              <input
                id="drawing-size"
                type="range"
                min={0.7}
                max={2.4}
                step={0.1}
                value={size}
                onChange={(event) => setSize(Number(event.target.value))}
                className="w-full"
              />

              <label htmlFor="drawing-color-picker" className="form-label">Color libre</label>
              <input
                id="drawing-color-picker"
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                aria-label="Color libre"
                className="h-11 w-full cursor-pointer rounded-md border border-[var(--line)] bg-transparent p-1"
              />

              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--fg-muted)]">Color rápido</p>
              <div className="grid grid-cols-6 gap-2">
                {COLORS.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() => setColor(swatch)}
                    className="min-h-11 rounded-full border-2 transition-transform active:scale-95"
                    style={{
                      background: swatch,
                      borderColor:
                        color.toLowerCase() === swatch.toLowerCase()
                          ? 'var(--accent)'
                          : 'var(--line)',
                    }}
                    aria-label={`Color rápido ${swatch}`}
                    title={swatch}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={undo} className="btn btn-ghost min-h-11">Deshacer</button>
                <button type="button" onClick={redo} className="btn btn-ghost min-h-11">Rehacer</button>
                <button type="button" onClick={clear} className="btn btn-ghost min-h-11">Limpiar</button>
                <button type="button" onClick={handleExport} className="btn btn-ghost min-h-11">Exportar PNG</button>
              </div>
            </div>

            <div className="surface space-y-3 p-4">
              <input value={name} onChange={(e) => setName(e.target.value)} className="form-input" maxLength={80} placeholder="Nombre" />
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="form-input min-h-[80px]" maxLength={220} placeholder="Mensaje breve" />
              <button type="button" onClick={saveDrawing} disabled={saving} className="btn btn-primary min-h-11 w-full disabled:opacity-70">
                {saving ? 'Colgando…' : 'Colgar dibujo'}
              </button>
              <button type="button" onClick={() => setStatus('Borrador restaurado.')} className="btn btn-ghost min-h-11 w-full">Restaurar borrador</button>
              {status && <p className="text-sm text-[var(--fg-muted)]">{status}</p>}
            </div>
          </aside>
        </div>

        <div className="mt-12">
          <h3 className="font-display text-3xl">Dibujos colgados</h3>
          {drawings.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-[var(--line)] p-8 text-center text-[var(--fg-muted)]">
              <p>Todavía no hay dibujos en la pared.</p>
              <p>Sé la primera señal.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {drawings.map((drawing) => (
                <button key={drawing.id} type="button" className="surface p-3 text-left" onClick={() => setLightbox(drawing)}>
                  <img src={drawing.image} alt={`Dibujo de ${drawing.name}`} loading="lazy" className="mb-3 h-56 w-full rounded-lg object-cover" />
                  <div className="text-sm font-semibold">{drawing.name || 'Anónimo'}</div>
                  {drawing.message && <p className="mt-1 text-sm text-[var(--fg-muted)]">{drawing.message}</p>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[120] bg-black/75 p-6" onClick={() => setLightbox(null)}>
          <div className="mx-auto max-w-3xl" onClick={(event) => event.stopPropagation()}>
            <img src={lightbox.image} alt={`Dibujo de ${lightbox.name}`} className="max-h-[80vh] w-full rounded-xl object-contain" />
          </div>
        </div>
      )}
    </section>
  )
}
