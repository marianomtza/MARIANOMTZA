'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { COLORS, Stroke, TOOLS, useCanvasDrawing } from '../../hooks/useCanvasDrawing'
import {
  clearDraft,
  fetchDrawings,
  pendingToDrawing,
  postDrawing,
  readDraftStrokes,
  readLocalDrawings,
  readPendingDrawings,
  syncPendingDrawings,
  writeDraftStrokes,
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
  const [hasMore, setHasMore] = useState(true)
  const [lightbox, setLightbox] = useState<Drawing | null>(null)
  const [hasDraft, setHasDraft] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  const mergeSources = (remote: Drawing[], local: Drawing[], pending: PendingDrawing[]) => {
    const pendingMapped = pending.map(pendingToDrawing)
    const all = [...pendingMapped, ...remote, ...local]
    const map = new Map<string, Drawing>()
    for (const item of all) {
      if (!map.has(item.id)) map.set(item.id, item)
    }
    return [...map.values()].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
  }

  useEffect(() => {
    const local = readLocalDrawings()
    const pending = readPendingDrawings()
    setPendingCount(pending.length)
    setDrawings(mergeSources([], local, pending))

    const draft = readDraftStrokes<Stroke>()
    if (draft.length) setHasDraft(true)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!strokes.length) return
      const saved = writeDraftStrokes(strokes)
      if (!saved.ok) setStatus(saved.error)
    }, AUTO_SAVE_MS)

    return () => clearTimeout(timer)
  }, [strokes])

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true)
      try {
        const data = await fetchDrawings(24, 0)
        const local = readLocalDrawings()
        const pending = readPendingDrawings()
        setPendingCount(pending.length)
        setDrawings(mergeSources(data.drawings, local, pending))
        setOffset(data.drawings.length)
        setHasMore(Boolean(data.nextOffset))
      } catch {
        setHasMore(false)
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

  useEffect(() => {
    const onOnline = async () => {
      const result = await syncPendingDrawings()
      setPendingCount(result.remaining)
      if (result.synced > 0) {
        setStatus(`Se sincronizaron ${result.synced} dibujos pendientes.`)
        const data = await fetchDrawings(24, 0).catch(() => null)
        if (data) {
          const pending = readPendingDrawings()
          setDrawings(mergeSources(data.drawings, readLocalDrawings(), pending))
          setOffset(data.drawings.length)
          setHasMore(Boolean(data.nextOffset))
        }
      }
    }

    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [])

  const restoreDraft = () => {
    const parsed = readDraftStrokes<Stroke>()
    if (!parsed.length) {
      setStatus('No se pudo restaurar el borrador.')
      return
    }
    loadStrokes(parsed)
    setHasDraft(false)
    setStatus('Borrador restaurado.')
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
    setStatus('PNG descargado.')
  }

  const savePending = async () => {
    const fullBlob = await exportWebpBlob(1200, 0.88)
    const thumbBlob = await exportWebpBlob(480, 0.88)
    if (!fullBlob || !thumbBlob) return

    const fullDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.readAsDataURL(fullBlob)
    })

    const thumbDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.readAsDataURL(thumbBlob)
    })

    const item: PendingDrawing = {
      id: crypto.randomUUID(),
      name: name.trim() || 'Anónimo',
      message: message.trim(),
      tool: activeTool,
      fullDataUrl,
      thumbDataUrl,
      created_at: new Date().toISOString(),
    }

    const pending = readPendingDrawings()
    const nextPending = [item, ...pending.filter((d) => d.id !== item.id)].slice(0, 10)
    const writeResult = writePendingDrawings(nextPending)
    if (!writeResult.ok) {
      setStatus(writeResult.error)
      return
    }

    setPendingCount(nextPending.length)
    setDrawings((prev) => [pendingToDrawing(item), ...prev].slice(0, 100))
    setStatus('Guardado localmente. Pendiente de sincronizar.')
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

      const formData = new FormData(event.currentTarget as HTMLFormElement)
      formData.set('full', new File([full], 'full.webp', { type: 'image/webp' }))
      formData.set('thumb', new File([thumb], 'thumb.webp', { type: 'image/webp' }))
      formData.set('tool', activeTool)

      const saved = await postDrawing(formData)
      if ('error' in saved) {
        await savePending()
      } else {
        setDrawings((prev) => [saved, ...prev.filter((item) => item.id !== saved.id)].slice(0, 100))
        setStatus('Dibujo colgado.')
      }

      clearDraft()
      loadStrokes([])
      setMessage('')
      setHasDraft(false)
    } catch {
      await savePending()
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
      if (!data.drawings.length) {
        setHasMore(false)
        return
      }
      const merged = [...drawings, ...data.drawings]
      const map = new Map<string, Drawing>()
      for (const item of merged) {
        if (!map.has(item.id)) map.set(item.id, item)
      }
      setDrawings([...map.values()])
      setOffset(offset + data.drawings.length)
      setHasMore(Boolean(data.nextOffset))
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
          {pendingCount > 0 && <p className="text-sm text-[var(--fg-muted)] mt-2">{pendingCount} dibujo(s) pendientes de sincronizar.</p>}
        </header>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 rounded-2xl border border-[var(--line-strong)] bg-[var(--bg-elevated)] p-3 shadow-[0_8px_28px_rgba(0,0,0,0.25)]">
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
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--fg-muted)]">Herramienta</p>
              <div className="grid grid-cols-2 gap-2">
                {TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setCurrentTool(tool.id)}
                    aria-pressed={activeTool === tool.id}
                    className={`btn ${activeTool === tool.id ? 'btn-primary' : 'btn-ghost'} !px-3 !py-2 min-h-11`}
                    aria-label={tool.label}
                  >
                    {tool.icon} {tool.label}
                  </button>
                ))}
              </div>

              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--fg-muted)]">Color</p>
              <div className="grid grid-cols-6 gap-2">
                {COLORS.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() => setColor(swatch)}
                    className="min-h-11 rounded-full border-2"
                    style={{ background: swatch, borderColor: color === swatch ? 'var(--accent)' : 'var(--line)' }}
                    aria-label={`Color ${swatch}`}
                  />
                ))}
              </div>

              <label htmlFor="drawing-size" className="form-label">Tamaño</label>
              <input
                id="drawing-size"
                type="range"
                min={1}
                max={24}
                step={1}
                value={Math.round(brushSize)}
                onChange={(event) => setBrushSize(Number(event.target.value))}
                className="w-full min-h-11"
                aria-label="Tamaño del trazo"
              />

              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={undo} className="btn btn-ghost min-h-11" aria-label="Deshacer" disabled={!canUndo}>Deshacer</button>
                <button type="button" onClick={redo} className="btn btn-ghost min-h-11" aria-label="Rehacer" disabled={!canRedo}>Rehacer</button>
                <button type="button" onClick={() => clear()} className="btn btn-ghost min-h-11 col-span-2" aria-label="Limpiar dibujo">Limpiar</button>
                <button type="button" onClick={exportPng} className="btn btn-ghost min-h-11 col-span-2" aria-label="Exportar PNG">Exportar PNG</button>
              </div>
            </div>

            <form onSubmit={saveDrawing} className="surface p-4 space-y-3">
              <label className="form-label" htmlFor="drawing-name">Firma</label>
              <input id="drawing-name" name="name" value={name} onChange={(e) => setName(e.target.value)} className="form-input" maxLength={80} />

              <label className="form-label" htmlFor="drawing-message">Mensaje</label>
              <textarea id="drawing-message" name="message" value={message} onChange={(e) => setMessage(e.target.value)} className="form-input min-h-[90px]" maxLength={220} />

              <div className="sr-only" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>

              <button type="submit" className="btn btn-primary w-full min-h-11" disabled={saving}>
                {saving ? 'Colgando…' : 'Colgar dibujo'}
              </button>

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
                      {drawing.pending_sync && <p className="text-xs text-[var(--accent)] mt-1">Pendiente de sincronizar</p>}
                      <p className="text-xs text-[var(--fg-subtle)] mt-2">{relativeDate(drawing.created_at)}</p>
                    </article>
                  )
                })}
              </div>
              {hasMore && (
                <div className="mt-5">
                  <button type="button" onClick={loadMore} className="btn btn-ghost min-h-11">Cargar más</button>
                </div>
              )}
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
