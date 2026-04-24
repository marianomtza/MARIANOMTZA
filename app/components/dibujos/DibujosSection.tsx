'use client'

import React, { useEffect, useState } from 'react'
import { useCanvasDrawing } from '../../hooks/useCanvasDrawing'
import { fetchWithRetry } from '../../lib/fetchWithRetry'
import { DrawingCanvas } from './DrawingCanvas'
import { DrawingMuseum } from './DrawingMuseum'

type Drawing = {
  id: string
  image: string
  name: string
  message: string
  tool: 'pencil' | 'marker' | 'ink' | 'eraser'
  created_at: string
}

const STORAGE_KEY = 'mmtza-local-drawings'

export function DibujosSection() {
  const drawing = useCanvasDrawing()

  const [name, setName] = useState('Anónimo')
  const [message, setMessage] = useState('')
  const [drawings, setDrawings] = useState<Drawing[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [brushSize, setBrushSize] = useState(6)

  const hasDrawing = drawing.strokeCount > 0
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine

  useEffect(() => {
    drawing.setBrushSize(brushSize)
  }, [brushSize, drawing])

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
    const image = drawing.exportImage()

    if (!image || !hasDrawing) {
      setError('Haz un dibujo antes de guardarlo.')
      return
    }

    if (!image.startsWith('data:image/png;base64,') || image.length > 1_900_000) {
      setError('El dibujo es inválido o demasiado grande.')
      return
    }

    const payload = {
      image,
      name: name.trim() || 'Anónimo',
      message: message.trim(),
      tool: drawing.currentTool,
    }

    const localItem: Drawing = {
      id: crypto.randomUUID(),
      image,
      name: payload.name,
      message: payload.message,
      tool: payload.tool,
      created_at: new Date().toISOString(),
    }

    setSaving(true)
    try {
      if (isOffline) {
        setDrawings((prev) => [localItem, ...prev])
        drawing.clear()
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
      drawing.clear()
      setMessage('')
    } catch (err) {
      setDrawings((prev) => [localItem, ...prev])
      const message = err instanceof Error ? err.message : 'Error al guardar dibujo'
      setError(`${message}. Se guardó en este dispositivo.`)
      drawing.clear()
    } finally {
      setSaving(false)
    }
  }

  return (
    <section id="dibujos" className="py-24 border-t border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[var(--accent)] mb-2">Museo persistente</p>
            <h2 className="font-display text-5xl">Dibujos</h2>
          </div>
        </div>

        <DrawingCanvas
          drawing={drawing}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          saveDrawing={saveDrawing}
          saving={saving}
          hasDrawing={hasDrawing}
          error={error}
          name={name}
          setName={setName}
          message={message}
          setMessage={setMessage}
        />

        <DrawingMuseum drawings={drawings} loading={loading} />
      </div>
    </section>
  )
}
