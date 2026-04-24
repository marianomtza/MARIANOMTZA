'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { COLORS, Stroke, TOOLS, useCanvasDrawing } from '../../hooks/useCanvasDrawing'
import {
  DRAWING_DRAFT_KEY,
  clearDraft,
  fetchDrawings,
  postDrawing,
  readLocalDrawings,
  readPendingDrawings,
  writeLocalDrawings,
  writePendingDrawings,
} from '../../lib/drawings'
import { Drawing, PendingDrawing } from '../../lib/types'

const AUTO_SAVE_MS = 2000

function relativeDate(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours} h`
  const days = Math.floor(hours / 24)
  return `Hace ${days} d`
}

function rotationFromId(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash << 5) - hash + id.charCodeAt(i)
  const normalized = ((hash % 200) + 200) % 200
  return (normalized / 100 - 1).toFixed(2)
}

export function DrawingSection() {
  const {
    canvasRef,
    strokes,
    canUndo,
    canRedo,
    hasContent,
    color,
    setColor,
    currentTool,
    setCurrentTool,
    start,
    draw,
    stop,
    clear,
    undo,
    redo,
    exportPngBlob,
    exportWebpBlob,
    loadStrokes,
  } = useCanvasDrawing()

  const [name, setName] = useState('Anónimo')
  const [message, setMessage] = useState('')
  const [drawings, setDrawings] = useState<Drawing[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [offset, setOffset] = useState(0)
  const [lightbox, setLightbox] = useState<Drawing | null>(null)
  const [hasDraft, setHasDraft] = useState(false)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setDrawings(readLocalDrawings())

    try {
      const draft = localStorage.getItem(DRAWING_DRAFT_KEY)
      if (draft) setHasDraft(true)
    } catch {
      setHasDraft(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!strokes.length) return
      try {
        localStorage.setItem(DRAWING_DRAFT_KEY, JSON.stringify(strokes))
      } catch {
        setStatus('No se pudo guardar el borrador local (storage lleno).')
      }
    }, AUTO_SAVE_MS)

    return () => clearTimeout(timer)
  }, [strokes])

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true)
      try {
        const data = await fetchDrawings(24, 0)
        if (data.drawings?.length) {
          setDrawings(data.drawings)
          setOffset(data.drawings.length)
        }
      } catch {
        // Local fallback already loaded.
      } finally {
        setLoading(false)
      }
    }

    void fetchInitial()
  }, [])

  useEffect(() => {
    if (!lightbox) return
    closeBtnRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(null)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(DRAWING_DRAFT_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Stroke[]
      loadStrokes(parsed)
      setHasDraft(false)
      setStatus('Borrador restaurado.')
    } catch {
      setStatus('No se pudo restaurar el borrador.')
    }
  }

  const exportPng = async () => {
    const blob = await exportPngBlob()
    if (!blob) return

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'mmtza-dibujo.png'
    link.click()
    URL.revokeObjectURL(url)
  }

  const saveFallbackLocal = async () => {
    const fullBlob = await exportPngBlob()
    if (!fullBlob) return

    const fullUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.readAsDataURL(fullBlob)
    })

    const localDrawing: Drawing = {
      id: crypto.randomUUID(),
      image: fullUrl,
      image_url: fullUrl,
      thumb_url: fullUrl,
      full_url: fullUrl,
      name: name.trim() || 'Anónimo',
      message: message.trim(),
      tool: currentTool,
      created_at: new Date().toISOString(),
      source: 'fallback-local',
    }

    const nextLocal = [localDrawing, ...readLocalDrawings()]
    const write = writeLocalDrawings(nextLocal)
    if (!write.ok) setStatus(write.error)

    const pendingItem: PendingDrawing = {
      id: localDrawing.id,
      name: localDrawing.name,
      message: localDrawing.message,
      tool: localDrawing.tool,
      fullDataUrl: fullUrl,
      thumbDataUrl: fullUrl,
      created_at: localDrawing.created_at,
    }

    const pending = readPendingDrawings()
    const deduped = [pendingItem, ...pending.filter((item) => item.id !== pendingItem.id)].slice(0, 10)
    const writePending = writePendingDrawings(deduped)
    if (!writePending.ok) setStatus(writePending.error)

    setDrawings((prev) => [localDrawing, ...prev.filter((item) => item.id !== localDrawing.id)].slice(0, 24))
  }

  const saveDrawing = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('')

    if (!hasContent) {
      setStatus('Primero dibuja algo.')
      return
    }

    setSaving(true)
    try {
      const full = await exportWebpBlob(1200, 0.88)
      const thumb = await exportWebpBlob(480, 0.88)

      if (!full || !thumb) throw new Error('No se pudo preparar imagen')

      const formData = new FormData()
      formData.append('full', new File([full], 'full.webp', { type: 'image/webp' }))
      formData.append('thumb', new File([thumb], 'thumb.webp', { type: 'image/webp' }))
      formData.append('name', name)
      formData.append('message', message)
      formData.append('tool', currentTool)
      formData.append('website', '')

      const saved = await postDrawing(formData)

      if ('error' in saved) {
        if (saved.fallback) {
          await saveFallbackLocal()
          setStatus('Storage no configurado. Se guardó solo en este dispositivo.')
        } else {
          setStatus(saved.error)
        }
      } else {
        setDrawings((prev) => [saved, ...prev.filter((item) => item.id !== saved.id)].slice(0, 24))
      }

      clearDraft()
      loadStrokes([])
      setMessage('')
      setHasDraft(false)
    } catch {
      await saveFallbackLocal()
      setStatus('No se pudo guardar en servidor. Se guardó solo en este dispositivo.')
      clearDraft()
      loadStrokes([])
      setHasDraft(false)
    } finally {
      setSaving(false)
    }
  }

  const loadMore = async () => {
    try {
      const data = await fetchDrawings(24, offset)
      if (!data.drawings?.length) return
      const merged = [...drawings, ...data.drawings].slice(0, 24)
      setDrawings(merged)
      setOffset(offset + data.drawings.length)
    } catch {
      setStatus('No se pudieron cargar más dibujos.')
    }
  }

  const lightboxUrl = lightbox?.full_url || lightbox?.image_url || lightbox?.image || ''

  const emptyState = useMemo(() => (
    <div className="rounded-2xl border border-dashed border-[var(--line-strong)] p-8 text-center text-[var(--fg-muted)]">
      <p>Todavía no hay dibujos en la pared.</p>
      <p>Sé la primera señal.</p>
    </div>
  ), [])

  return (
    <section id="deja-tu-dibujo" className="border-t border-[var(--line)] py-20">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <header className="mb-8">
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[var(--accent)] mb-2">PARED ABIERTA</p>
          <h2 className="font-display fluid-h2">DEJA TU DIBUJO</h2>
          <p className="text-lg text-[var(--fg-muted)] mt-2">No acepto reseñas, ni opiniones, solo dibujitos.</p>
        </header>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 rounded-2xl border border-[var(--line-strong)] bg-[#f6f1e8] p-3 shadow-[0_8px_28px_rgba(0,0,0,0.25)]">
            <canvas
              ref={canvasRef}
              className="w-full h-[320px] md:h-[460px] rounded-xl touch-none"
              aria-label="Área para dibujar"
              onPointerDown={start}
              onPointerMove={draw}
              onPointerUp={stop}
              onPointerCancel={stop}
              style={{ touchAction: 'none' }}
            />
          </div>

          <aside className="lg:col-span-4 space-y-4">
            <div className="surface p-4 space-y-3">
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--fg-muted)]">Herramientas</p>
              <div className="grid grid-cols-2 gap-2">
                {TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setCurrentTool(tool.id)}
                    aria-pressed={currentTool === tool.id}
                    className={`btn ${currentTool === tool.id ? 'btn-primary' : 'btn-ghost'} !px-3 !py-2 min-h-11`}
                    aria-label={tool.label}
                  >
                    {tool.icon} {tool.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((swatch) => (
                  <button
                    key={swatch}
                    onClick={() => setColor(swatch)}
                    className="min-h-11 rounded-full border-2"
                    style={{ background: swatch, borderColor: color === swatch ? 'var(--accent)' : 'var(--line)' }}
                    aria-label={`Color ${swatch}`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={undo} className="btn btn-ghost min-h-11" aria-label="Deshacer" disabled={!canUndo}>Deshacer</button>
                <button onClick={redo} className="btn btn-ghost min-h-11" aria-label="Rehacer" disabled={!canRedo}>Rehacer</button>
                <button onClick={() => clear()} className="btn btn-ghost min-h-11 col-span-2" aria-label="Limpiar dibujo">Limpiar</button>
              </div>
            </div>

            <form onSubmit={saveDrawing} className="surface p-4 space-y-3">
              <label className="form-label" htmlFor="drawing-name">Firma</label>
              <input id="drawing-name" value={name} onChange={(e) => setName(e.target.value)} className="form-input" maxLength={80} />

              <label className="form-label" htmlFor="drawing-message">Mensaje</label>
              <textarea id="drawing-message" value={message} onChange={(e) => setMessage(e.target.value)} className="form-input min-h-[90px]" maxLength={220} />

              <button type="submit" className="btn btn-primary w-full min-h-11" disabled={saving}>
                {saving ? 'Colgando...' : 'Colgar en la pared'}
              </button>
              <button type="button" onClick={exportPng} className="btn btn-ghost w-full min-h-11">Exportar PNG</button>

              {hasDraft && <button type="button" onClick={restoreDraft} className="btn btn-ghost w-full min-h-11">Restaurar borrador</button>}
              {status && <p className="text-sm text-[var(--fg-muted)]">{status}</p>}
            </form>
          </aside>
        </div>

        <div className="mt-10">
          <h3 className="font-display text-4xl mb-4">Dibujos colgados</h3>

          {loading ? (
            <p className="text-[var(--fg-muted)]">Cargando pared...</p>
          ) : drawings.length === 0 ? (
            emptyState
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {drawings.map((drawing) => {
                  const preview = drawing.thumb_url || drawing.image_url || drawing.image || ''
                  return (
                    <article
                      key={drawing.id}
                      className="surface p-3 transition-transform duration-200 hover:-translate-y-1 cursor-pointer"
                      style={{ transform: `rotate(${rotationFromId(drawing.id)}deg)` }}
                      onClick={() => setLightbox(drawing)}
                    >
                      <img
                        src={preview}
                        alt={`Dibujo de ${drawing.name || 'Anónimo'}`}
                        className="w-full h-56 object-cover rounded-lg mb-3"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="text-sm font-semibold">{drawing.name || 'Anónimo'}</div>
                      {drawing.message && <p className="text-sm text-[var(--fg-muted)] mt-1">{drawing.message}</p>}
                      <p className="text-xs text-[var(--fg-subtle)] mt-2">{relativeDate(drawing.created_at)}</p>
                    </article>
                  )
                })}
              </div>
              <div className="mt-5">
                <button onClick={loadMore} className="btn btn-ghost min-h-11">Cargar más</button>
              </div>
            </>
          )}
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[80] bg-black/75 p-4 md:p-8 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) setLightbox(null)
          }}
        >
          <div className="surface max-w-4xl w-full p-4 md:p-6">
            <div className="flex justify-end">
              <button ref={closeBtnRef} className="btn btn-ghost min-h-11" onClick={() => setLightbox(null)} aria-label="Cerrar lightbox">Cerrar</button>
            </div>
            <img src={lightboxUrl} alt={`Dibujo de ${lightbox.name || 'Anónimo'}`} className="w-full max-h-[70vh] object-contain rounded-lg" />
            <div className="mt-4">
              <p className="font-semibold">{lightbox.name || 'Anónimo'}</p>
              {lightbox.message && <p className="text-[var(--fg-muted)]">{lightbox.message}</p>}
              <p className="text-xs text-[var(--fg-subtle)]">{relativeDate(lightbox.created_at)}</p>
              <a className="btn btn-ghost min-h-11 mt-3" href={lightboxUrl} download={`dibujo-${lightbox.id}.webp`}>Descargar</a>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
