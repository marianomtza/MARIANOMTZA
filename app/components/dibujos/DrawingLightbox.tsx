'use client'

import React, { useEffect } from 'react'
import { DrawingRecord, relativeDate } from '../../lib/drawings'

interface DrawingLightboxProps {
  drawing: DrawingRecord | null
  onClose: () => void
}

export function DrawingLightbox({ drawing, onClose }: DrawingLightboxProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!drawing) return null

  return (
    <div className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-sm p-4 md:p-8" onClick={onClose} role="dialog" aria-modal="true">
      <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--line)] rounded-2xl p-4 md:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between gap-4 items-start mb-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--fg-muted)]">{relativeDate(drawing.created_at)}</p>
            <h3 className="font-display text-3xl">{drawing.name || 'Anónimo'}</h3>
            {drawing.message && <p className="text-[var(--fg-muted)] mt-2">{drawing.message}</p>}
          </div>
          <button type="button" className="btn btn-ghost min-h-11" onClick={onClose}>Cerrar</button>
        </div>

        <img src={drawing.image} alt={`Dibujo de ${drawing.name || 'Anónimo'}`} className="w-full max-h-[70vh] object-contain rounded-xl bg-[#f8f5f0]" />

        <div className="mt-4 flex justify-end">
          <a href={drawing.image} download={`mmtza-${drawing.id}.png`} className="btn btn-primary min-h-11">Descargar</a>
        </div>
      </div>
    </div>
  )
}
