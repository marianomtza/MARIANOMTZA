'use client'

import React from 'react'
import { DrawingRecord } from '../../lib/drawings'
import { DrawingCard } from './DrawingCard'

interface DrawingMuseumProps {
  drawings: DrawingRecord[]
  loading: boolean
  visibleCount: number
  onLoadMore: () => void
  onOpen: (drawing: DrawingRecord) => void
}

export function DrawingMuseum({ drawings, loading, visibleCount, onLoadMore, onOpen }: DrawingMuseumProps) {
  if (loading) return <p className="text-[var(--fg-muted)]">Cargando dibujos…</p>

  if (drawings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--line)] p-8 text-center">
        <p className="text-[var(--fg-muted)]">Todavía no hay dibujos en la pared.</p>
        <p className="text-[var(--fg-muted)]">Sé la primera señal.</p>
      </div>
    )
  }

  const visible = drawings.slice(0, visibleCount)

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map((drawing) => (
          <DrawingCard key={drawing.id} drawing={drawing} onOpen={onOpen} />
        ))}
      </div>
      {visibleCount < drawings.length && (
        <div className="flex justify-center">
          <button type="button" className="btn btn-ghost min-h-11" onClick={onLoadMore}>Cargar más</button>
        </div>
      )}
    </div>
  )
}
