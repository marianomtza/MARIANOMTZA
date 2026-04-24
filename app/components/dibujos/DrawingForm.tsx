'use client'

import React from 'react'

interface DrawingFormProps {
  name: string
  message: string
  honeypot: string
  statusText: string
  saving: boolean
  setName: (value: string) => void
  setMessage: (value: string) => void
  setHoneypot: (value: string) => void
  onSubmit: () => void
  disabled: boolean
}

export function DrawingForm({
  name,
  message,
  honeypot,
  statusText,
  saving,
  setName,
  setMessage,
  setHoneypot,
  onSubmit,
  disabled,
}: DrawingFormProps) {
  return (
    <section className="surface p-4 space-y-3">
      <label className="form-label">Firma</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={80}
        className="form-input"
        placeholder="Anónimo"
      />

      <label className="form-label">Mensaje</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={220}
        className="form-input min-h-[88px]"
        placeholder="Mensaje breve"
      />

      <input
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="sr-only"
        aria-hidden
      />

      <button type="button" className="btn btn-primary min-h-11 w-full disabled:opacity-60" onClick={onSubmit} disabled={disabled || saving}>
        {saving ? 'Colgando…' : 'Colgar dibujo'}
      </button>

      <p className="text-sm text-[var(--fg-muted)] min-h-5">{statusText}</p>
    </section>
  )
}
