import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useBookingState } from '../contexts/BookingContext'
import { ARTIST_NAMES } from '../lib/roster'

export const Booking: React.FC = () => {
  const { selectedArtist } = useBookingState()
  const [artist, setArtist] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  useEffect(() => {
    if (selectedArtist) setArtist(selectedArtist)
  }, [selectedArtist])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('success')
  }

  return (
    <section id="reserva" className="section border-t border-[var(--line)] py-24">
      <div className="mx-auto grid max-w-[1120px] gap-12 px-6 md:grid-cols-2 md:px-12">
        <div>
          <h2 className="text-[48px] font-semibold tracking-tight">Booking</h2>
          <p className="mt-5 max-w-[40ch] text-[var(--fg-dim)]">
            Cuéntanos ciudad, venue y objetivo del evento. Respuesta rápida y propuesta clara.
          </p>
          <div className="mt-8 space-y-2 text-sm">
            <a href="mailto:hola@marianomtza.com" className="block text-[var(--fg)] hover:text-[var(--muted-accent)]">hola@marianomtza.com</a>
            <a href="tel:+524434264931" className="block text-[var(--fg)] hover:text-[var(--muted-accent)]">+52 443 426 4931</a>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-8">
          <div>
            <label className="form-label">ARTISTA</label>
            <select value={artist} onChange={(e) => setArtist(e.target.value)} className="form-input">
              <option value="">Selecciona artista</option>
              {ARTIST_NAMES.map((item) => (
                <option value={item} key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">NOMBRE</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="form-label">EMAIL</label>
            <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <button className="btn btn-primary" type="submit">Enviar solicitud</button>

          <AnimatePresence>
            {status === 'success' && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-[var(--fg-dim)]">
                Recibido. También puedes escribir directo a hola@marianomtza.com.
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </div>
    </section>
  )
}
