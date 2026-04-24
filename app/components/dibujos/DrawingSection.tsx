'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useCanvasDrawing } from '../../hooks/useCanvasDrawing'
import {
  DRAWING_STORAGE_KEYS,
  DrawingRecord,
  DrawingStroke,
  isSafeDataUrl,
  sanitizeDrawingText,
} from '../../lib/drawings'
import { fetchWithRetry } from '../../lib/fetchWithRetry'
import { DrawingCanvas } from './DrawingCanvas'
import { DrawingToolbar } from './DrawingToolbar'
import { DrawingForm } from './DrawingForm'
import { DrawingMuseum } from './DrawingMuseum'
import { DrawingLightbox } from './DrawingLightbox'

export function DrawingSection() {
  const drawing = useCanvasDrawing()
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [statusText, setStatusText] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingMuseum, setLoadingMuseum] = useState(true)
  const [drawings, setDrawings] = useState<DrawingRecord[]>([])
  const [visibleCount, setVisibleCount] = useState(24)
  const [selected, setSelected] = useState<DrawingRecord | null>(null)

  const saveDraft = useCallback((strokes: DrawingStroke[]) => {
    localStorage.setItem(DRAWING_STORAGE_KEYS.draft, JSON.stringify({ strokes, updatedAt: Date.now() }))
  }, [])

  const loadDraft = useCallback(() => {
    const raw = localStorage.getItem(DRAWING_STORAGE_KEYS.draft)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as { strokes?: DrawingStroke[] }
      if (parsed.strokes?.length) {
        if (window.confirm('Tienes un dibujo sin colgar. ¿Restaurar?')) {
          drawing.loadStrokes(parsed.strokes)
        }
      }
    } catch {
      // noop
    }
  }, [drawing])

  useEffect(() => {
    loadDraft()
  }, [loadDraft])

  useEffect(() => {
    const id = window.setInterval(() => {
      if (drawing.hasDrawing) saveDraft(drawing.strokes)
    }, 2000)
    return () => window.clearInterval(id)
  }, [drawing.hasDrawing, drawing.strokes, saveDraft])

  const syncPending = useCallback(async () => {
    const raw = localStorage.getItem(DRAWING_STORAGE_KEYS.pending)
    if (!raw) return

    let pending: DrawingRecord[] = []
    try {
      pending = JSON.parse(raw) as DrawingRecord[]
    } catch {
      return
    }

    const remaining: DrawingRecord[] = []
    for (const item of pending) {
      try {
        const response = await fetchWithRetry('/api/drawings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        })
        if (!response.ok) remaining.push(item)
      } catch {
        remaining.push(item)
      }
    }

    localStorage.setItem(DRAWING_STORAGE_KEYS.pending, JSON.stringify(remaining))
  }, [])

  useEffect(() => {
    void syncPending()
    window.addEventListener('online', syncPending)
    return () => window.removeEventListener('online', syncPending)
  }, [syncPending])

  useEffect(() => {
    const load = async () => {
      setLoadingMuseum(true)
      try {
        const response = await fetchWithRetry('/api/drawings?limit=48&offset=0', undefined, 1)
        if (!response.ok) throw new Error('failed')
        const data = (await response.json()) as { drawings?: DrawingRecord[] }
        if (data.drawings) {
          setDrawings(data.drawings)
          localStorage.setItem(DRAWING_STORAGE_KEYS.local, JSON.stringify(data.drawings))
        }
      } catch {
        const local = localStorage.getItem(DRAWING_STORAGE_KEYS.local)
        if (local) {
          try {
            setDrawings(JSON.parse(local) as DrawingRecord[])
          } catch {
            setDrawings([])
          }
        }
      } finally {
        setLoadingMuseum(false)
      }
    }

    void load()
  }, [])

  const submit = useCallback(async () => {
    if (honeypot) return
    if (!drawing.hasDrawing) {
      setStatusText('Primero dibuja algo.')
      return
    }

    const image = drawing.exportDataUrl()
    if (!image || !isSafeDataUrl(image) || image.length > 1_900_000) {
      setStatusText('No pude preparar el dibujo.')
      return
    }

    const payload: DrawingRecord = {
      id: crypto.randomUUID(),
      image,
      name: sanitizeDrawingText(name, 80) || 'Anónimo',
      message: sanitizeDrawingText(message, 220),
      tool: drawing.tool,
      created_at: new Date().toISOString(),
    }

    setSaving(true)
    setStatusText('Colgando…')
    try {
      const response = await fetchWithRetry('/api/drawings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('api')
      const saved = (await response.json()) as DrawingRecord
      setDrawings((prev) => [saved, ...prev])
      setStatusText('Ya quedó colgado.')
    } catch {
      const pending = JSON.parse(localStorage.getItem(DRAWING_STORAGE_KEYS.pending) || '[]') as DrawingRecord[]
      localStorage.setItem(DRAWING_STORAGE_KEYS.pending, JSON.stringify([payload, ...pending]))
      setDrawings((prev) => [payload, ...prev])
      setStatusText(navigator.onLine ? 'No pude subirlo ahora. Lo guardé en este dispositivo.' : 'Sin conexión. Lo guardé localmente.')
    } finally {
      setSaving(false)
      drawing.clear()
      localStorage.removeItem(DRAWING_STORAGE_KEYS.draft)
      setMessage('')
    }
  }, [drawing, honeypot, message, name])

  const onExport = useCallback(() => {
    drawing.exportPng()
    setStatusText('PNG descargado.')
  }, [drawing])

  const onClear = useCallback(() => {
    if (!drawing.hasDrawing) return
    if (window.confirm('¿Limpiar la hoja?')) {
      drawing.clear()
    }
  }, [drawing])

  const sectionCopy = useMemo(
    () => 'No acepto reseñas, ni opiniones, solo dibujitos.',
    []
  )

  return (
    <section id="dibujos" className="py-24 border-t border-[var(--line)] bg-[var(--bg)]">
      <div className="max-w-[1240px] mx-auto px-6 md:px-12">
        <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[var(--accent)] mb-3">PARED ABIERTA</p>
        <h2 className="font-display fluid-h2 mb-4">DEJA TU DIBUJO</h2>
        <p className="text-[var(--fg-muted)] text-lg max-w-[60ch] mb-10">{sectionCopy}</p>

        <div className="grid lg:grid-cols-12 gap-7">
          <div className="lg:col-span-8">
            <DrawingCanvas drawing={drawing} />
          </div>
          <div className="lg:col-span-4 space-y-5">
            <DrawingToolbar drawing={drawing} onClear={onClear} onExport={onExport} />
            <DrawingForm
              name={name}
              message={message}
              honeypot={honeypot}
              statusText={statusText}
              saving={saving}
              setName={setName}
              setMessage={setMessage}
              setHoneypot={setHoneypot}
              onSubmit={() => void submit()}
              disabled={!drawing.hasDrawing}
            />
          </div>
        </div>

        <div className="mt-14">
          <h3 className="font-display text-[clamp(1.8rem,3.4vw,3rem)] mb-6">Dibujos colgados</h3>
          <DrawingMuseum
            drawings={drawings}
            loading={loadingMuseum}
            visibleCount={visibleCount}
            onLoadMore={() => setVisibleCount((v) => v + 24)}
            onOpen={setSelected}
          />
        </div>
      </div>

      <DrawingLightbox drawing={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
