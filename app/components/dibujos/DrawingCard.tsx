'use client'

import React from 'react'
import { DrawingRecord, relativeDate, stableTiltFromId } from '../../lib/drawings'

export function DrawingCard({ drawing, onOpen }: { drawing: DrawingRecord; onOpen: (drawing: DrawingRecord) => void }) {
  const tilt = stableTiltFromId(drawing.id)

  return (
    <button
      type="button"
      onClick={() => onOpen(drawing)}
      className="surface p-3 text-left transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <img src={drawing.image} alt={`Dibujo de ${drawing.name || 'Anónimo'}`} loading="lazy" decoding="async" className="w-full h-44 object-cover rounded-lg mb-3" />
      <div className="text-sm font-semibold">{drawing.name || 'Anónimo'}</div>
      {drawing.message && <p className="text-sm text-[var(--fg-muted)] mt-1">“{drawing.message}”</p>}
      <p className="text-[11px] mt-2 font-mono tracking-[0.15em] uppercase text-[var(--fg-subtle)]">{relativeDate(drawing.created_at)}</p>
    </button>
  )
}
