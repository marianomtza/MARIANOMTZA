'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useBookingState } from '../contexts/BookingContext'
import { ARTIST_NAMES } from '../lib/roster'

const CONTACT = {
  email: 'hola@marianomtza.com',
  phone: '+52 443 426 4931',
  phoneClean: '+524434264931',
}

export const Booking: React.FC = () => {
  const { selectedArtist, clearSelectedArtist, scrollRequest } = useBookingState()

  const [mode, setMode] = useState<'artista' | 'servicio'>('artista')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    artist: '',
    date: '',
    city: '',
    venue: '',
    capacity: '',
    eventType: '',
    budget: '',
    notes: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (selectedArtist) {
      setFormData((prev) => ({ ...prev, artist: selectedArtist }))
      setMode('artista')
      if (scrollRequest > 0) {
        setTimeout(() => {
          const el = document.getElementById('reserva')
          el?.scrollIntoView({ behavior: 'smooth' })
        }, 120)
      }
    }
  }, [selectedArtist, scrollRequest])

  const handleModeChange = (newMode: 'artista' | 'servicio') => {
    setMode(newMode)
    if (newMode === 'servicio') {
      clearSelectedArtist()
      setFormData((prev) => ({ ...prev, artist: '' }))
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validate = (): boolean => {
    if (!formData.name || !formData.email || !formData.date || !formData.city) {
      setError('Completa los campos marcados.')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('El email no es válido.')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return

    setStatus('loading')
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          artist: formData.artist,
          date: formData.date,
          city: formData.city,
          venue: formData.venue,
          capacity: formData.capacity,
          event_type: formData.eventType,
          budget: formData.budget,
          notes: formData.notes,
        }),
      })
      if (!response.ok) throw new Error('failed')
      setStatus('success')
      confetti({ particleCount: 140, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true })
      setTimeout(() => {
        setFormData({
          name: '', email: '', artist: '', date: '', city: '', venue: '',
          capacity: '', eventType: '', budget: '', notes: '',
        })
        clearSelectedArtist()
        setStatus('idle')
      }, 2400)
    } catch (err) {
      console.error(err)
      setStatus('error')
      setError('No pudimos enviar tu solicitud. Escríbenos directo a ' + CONTACT.email)
    }
  }

  return (
    <section
      id="reserva"
      className="section py-28 border-t border-[var(--line)] bg-[var(--bg)]"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-12 gap-x-16 gap-y-12">
          {/* Left info */}
          <aside className="md:col-span-5">
            <div className="md:sticky md:top-24">
              <div className="font-mono text-[11px] tracking-[0.28em] text-[var(--accent)] mb-4 uppercase">
                Booking · Servicios
              </div>
              <h2 className="font-display text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.02em] text-[var(--fg)] mb-8">
                Hablemos de tu próxima noche.
              </h2>
              <p className="font-editorial text-lg text-[var(--fg-muted)] max-w-[38ch] mb-10">
                Booking de roster, dirección creativa y producción integral. Respuesta en 24h hábiles.
              </p>

              <div className="space-y-1 text-sm">
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="link-underline block text-[var(--fg)] text-base py-1"
                >
                  {CONTACT.email}
                </a>
                <a
                  href={`https://wa.me/${CONTACT.phoneClean.replace('+', '')}`}
                  className="link-underline block text-[var(--fg-muted)] font-mono text-sm py-1 tracking-wide"
                  aria-label="WhatsApp +52 443 426 4931"
                >
                  {CONTACT.phone}
                </a>
              </div>
            </div>
          </aside>

          {/* Form */}
          <div className="md:col-span-7">
            <div className="flex mb-10 border-b border-[var(--line-strong)]">
              {(['artista', 'servicio'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  type="button"
                  className={`flex-1 pb-4 text-[12px] tracking-[0.22em] font-medium transition-all relative uppercase ${
                    mode === m ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
                  }`}
                >
                  {m === 'artista' ? 'Artista del roster' : 'Otro servicio'}
                  {mode === m && (
                    <motion.div
                      layoutId="mode-underline"
                      className="absolute bottom-[-1px] left-0 h-px w-full bg-[var(--accent)]"
                    />
                  )}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-9">
              <AnimatePresence mode="wait">
                {mode === 'artista' && (
                  <motion.div
                    key="artista"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-9"
                  >
                    <div>
                      <label className="form-label">Artista</label>
                      <select
                        name="artist"
                        value={formData.artist}
                        onChange={handleChange}
                        className="form-input"
                      >
                        <option value="">Elige del roster</option>
                        {ARTIST_NAMES.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Alex Rivera"
                  />
                </div>
                <div>
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="tu@empresa.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="form-label">Fecha *</label>
                  <input
                    type="text"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    placeholder="06 / 2026"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Ciudad · Venue *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="CDMX · Foro Indie Rocks"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="form-label">Capacidad</label>
                  <input
                    type="text"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="800 – 1200"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Tipo</label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="">Selecciona</option>
                    <option value="Noche de club">Noche de club</option>
                    <option value="Festival">Festival</option>
                    <option value="Evento privado">Evento privado</option>
                    <option value="Corporativo">Corporativo</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Presupuesto</label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="">Selecciona</option>
                    <option value="$2,000–$5,000 MXN">$2,000–$5,000 MXN</option>
                    <option value="$5,000–$10,000 MXN">$5,000–$10,000 MXN</option>
                    <option value="$10,000–$25,000 MXN">$10,000–$25,000 MXN</option>
                    <option value="$25,000–$50,000 MXN">$25,000–$50,000 MXN</option>
                    <option value="$50,000+ MXN">$50,000+ MXN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Notas</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Visión, referencias, requerimientos especiales…"
                  className="form-input resize-y min-h-[92px]"
                />
              </div>

              <div className="pt-3 flex items-center justify-between flex-wrap gap-4">
                <div className="text-[10px] tracking-[0.22em] text-[var(--fg-muted)] font-mono uppercase">
                  * Campos obligatorios
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn btn-primary disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span>
                    {status === 'loading'
                      ? 'Enviando…'
                      : status === 'success'
                        ? 'Recibido ✓'
                        : 'Enviar solicitud'}
                  </span>
                  <span aria-hidden>↗</span>
                </button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[var(--accent)] text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
