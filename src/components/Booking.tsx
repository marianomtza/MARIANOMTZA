import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useBookingState } from '../contexts/BookingContext'
import { ARTIST_NAMES } from '../data/roster'

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
    eventName: '',
    budget: '',
    notes: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  // Autofill + scroll from roster
  useEffect(() => {
    if (selectedArtist) {
      setFormData(prev => ({ ...prev, artist: selectedArtist }))
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
      setFormData(prev => ({ ...prev, artist: '' }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validate = (): boolean => {
    if (!formData.name || !formData.email || !formData.date || !formData.city) {
      setError('Por favor completa todos los campos requeridos')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('El email no es válido')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validate()) return

    setStatus('loading')

    // Simulate API call (replace with real Supabase/Resend in production)
    setTimeout(() => {
      setStatus('success')
      
      // Confetti celebration
      confetti({
        particleCount: 160,
        spread: 75,
        origin: { y: 0.58 }
      })
      
      setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 55,
          spread: 65,
          origin: { x: 0.12 }
        })
      }, 280)

      // Reset form
      setTimeout(() => {
        setFormData({
          name: '', email: '', artist: '', date: '', city: '', venue: '', 
          capacity: '', eventType: '', eventName: '', budget: '', notes: ''
        })
        clearSelectedArtist()
        setStatus('idle')
      }, 2100)
    }, 850)
  }

  return (
    <section id="reserva" className="section py-24 border-t border-white/10 bg-black/50">
      <div className="max-w-[1120px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-12 gap-x-16">
          {/* Left info */}
          <div className="md:col-span-5 mb-16 md:mb-0">
            <div className="sticky top-24">
              <div className="font-mono text-xs tracking-[0.24em] text-[#9b5fd6] mb-4">PRÓXIMO CAPÍTULO</div>
              <h2 className="text-[68px] leading-none tracking-[-2.2px] font-semibold text-white mb-8">
                Reserva tu noche<br />Hablemos de tu próxima noche
              </h2>
              
              <div className="text-[#8a7fa0] text-[15px] max-w-[34ch] leading-relaxed">
                Ya sea que busques un artista para tu noche o una dirección creativa completa — estamos listos para construirlo juntos.
              </div>

              <div className="mt-14 pt-8 border-t border-white/10 text-xs font-mono tracking-widest text-white/50">
                RESPUESTA EN 48 HORAS • CONFIDENCIAL
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-7">
            {/* Mode Toggle */}
            <div className="flex mb-10 border-b border-white/10">
              {(['artista', 'servicio'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className={`
                    flex-1 pb-4 text-sm tracking-[1.5px] font-medium transition-all relative
                    ${mode === m ? 'text-white' : 'text-white/40 hover:text-white/70'}
                  `}
                >
                  {m === 'artista' ? 'Artista' : 'Servicio'}
                  {mode === m && (
                    <motion.div 
                      layoutId="mode-underline"
                      className="absolute bottom-0 left-0 h-px w-full bg-[#9b5fd6]" 
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
                      <label className="form-label">ARTISTA SELECCIONADO</label>
                      <select 
                        name="artist" 
                        value={formData.artist} 
                        onChange={handleChange}
                        className="form-input text-lg text-white/90"
                      >
                        <option value="">Elige del roster...</option>
                        {ARTIST_NAMES.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="form-label">NOMBRE *</label>
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
                  <label className="form-label">EMAIL *</label>
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
                  <label className="form-label">FECHA (MM / AAAA) *</label>
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
                  <label className="form-label">CIUDAD + VENUE</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange}
                    placeholder="CDMX • Foro Indie Rocks"
                    className="form-input" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="form-label">CAPACIDAD</label>
                  <input 
                    type="text" 
                    name="capacity" 
                    value={formData.capacity} 
                    onChange={handleChange}
                    placeholder="800 - 1200" 
                    className="form-input" 
                  />
                </div>
                <div>
                  <label className="form-label">TIPO DE EVENTO</label>
                  <select 
                    name="eventType" 
                    value={formData.eventType} 
                    onChange={handleChange}
                    className="form-input text-white/80"
                  >
                    <option value="">Selecciona...</option>
                    <option value="Noche de club">Noche de club</option>
                    <option value="Festival">Festival</option>
                    <option value="Evento privado">Evento privado</option>
                    <option value="Corporativo">Corporativo</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">PRESUPUESTO</label>
                  <select 
                    name="budget" 
                    value={formData.budget} 
                    onChange={handleChange}
                    className="form-input text-white/80"
                  >
                    <option value="">Selecciona...</option>
                    <option value="$3,000 - $6,000 USD">$3k – $6k USD</option>
                    <option value="$6,000 - $12,000 USD">$6k – $12k USD</option>
                    <option value="$12,000+ USD">$12k+ USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">NOMBRE DEL EVENTO / NOTAS</label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleChange}
                  rows={4}
                  placeholder="Cuéntanos más sobre la visión del evento..."
                  className="form-input resize-y min-h-[92px]" 
                />
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div className="text-[10px] tracking-widest text-white/40 font-mono">* CAMPOS OBLIGATORIOS</div>
                
                <motion.button
                  type="submit"
                  disabled={status === 'loading'}
                  className="group flex items-center gap-4 px-11 py-4 bg-white text-black text-xs tracking-[2px] font-medium rounded-full disabled:opacity-70 hover:bg-[#9b5fd6] hover:text-white transition-all active:scale-[0.985]"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.985 }}
                >
                  {status === 'loading' ? 'ENVIANDO...' : status === 'success' ? 'SOLICITUD RECIBIDA ✓' : 'ENVIAR SOLICITUD'}
                  <span className="group-hover:translate-x-1 transition">↗</span>
                </motion.button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-sm"
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