'use client'

import React from 'react'

type Drawing = {
  id: string
  image: string
  name: string
  message: string
}

interface DrawingMuseumProps {
  drawings: Drawing[]
  loading: boolean
}

export function DrawingMuseum({ drawings, loading }: DrawingMuseumProps) {
  if (loading) {
    return <div className="text-[var(--fg-muted)]">Cargando museo…</div>
  }

  if (drawings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--line)] p-8 text-center text-[var(--fg-muted)]">
        Aún no hay piezas en el museo. Sé la primera señal nocturna.
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {drawings.map((drawing) => (
        <article key={drawing.id} className="surface p-3">
          <img src={drawing.image} alt={`Dibujo de ${drawing.name}`} className="w-full h-56 object-cover rounded-lg mb-3" />
          <div className="text-sm font-semibold">{drawing.name}</div>
          {drawing.message && <p className="text-sm text-[var(--fg-muted)] mt-1">{drawing.message}</p>}
        </article>
      ))}
    </div>
  )
}
