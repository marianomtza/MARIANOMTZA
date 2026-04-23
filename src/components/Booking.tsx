import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBookingState, useBookingActions } from '../contexts/BookingContext'
import { ARTIST_NAMES } from '../data/roster'

export const Booking = () => {
  const { selectedArtist, clearSelectedArtist, scrollRequest } = useBookingState()
  const { setSelectedArtist } = useBookingActions()

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

  // Autofill from roster selection
  useEffect(() => {
    if (selectedArtist) {
      setFormData(prev => ({ ...prev, artist: selectedArtist }))
      setMode('artista')
      // Scroll to booking when requested
      if (scrollRequest > 0) {
        const el = document.getElementById('booking')
        el?.scrollIntoView({ behavior: 'smooth' })
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

  const validate = () => {
    if (!formData.name || !formData.email || !formData.date || !formData.city) {
      setError('Please fill all required fields')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Invalid email address')
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
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          mode,
          timestamp: new Date().toISOString(),
        }),
      })

      if (res.ok) {
        setStatus('success')
        setTimeout(() => {
          setFormData({
            name: '', email: '', artist: '', date: '', city: '', venue: '', 
            capacity: '', eventType: '', eventName: '', budget: '', notes: ''
          })
          clearSelectedArtist()
          setStatus('idle')
        }, 2200)
      } else {
        throw new Error('Submission failed')
      }
    } catch (err) {
      setStatus('error')
      setError('Something went wrong. Please try again or email hola@marianomtza.com')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <section id="booking" className="section py-24 border-t border-white/10 bg-black/40">
      <div className="max-w-[1100px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-12 gap-x-16">
          {/* Left: Info */}
          <div className="md:col-span-5 mb-16 md:mb-0">
            <div className="sticky top-24">
              <div className="font-mono text-xs tracking-[0.24em] text-[#9b5fd6] mb-4">NEXT CHAPTER</div>
              <h2 className="text-[72px] leading-none tracking-[-2.4px] font-semibold text-white mb-8">Let's create<br />something<br />unforgettable.</h2>
              
              <div className="text-[#8a7fa0] text-[15px] max-w-[34ch]">
                Whether you're looking for an artist for your night or a full creative direction service — we're ready.
              </div>

              <div className="mt-12 pt-8 border-t border-white/10 text-xs font-mono tracking-widest text-white/50">
                RESPONSE WITHIN 48HRS • CONFIDENTIAL
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
                  {m === 'artista' ? 'BOOK AN ARTIST' : 'CREATIVE SERVICES'}
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-9"
                  >
                    <div>
                      <label className="block text-xs tracking-[0.24em] text-white/60 mb-3">SELECTED ARTIST</label>
                      <select 
                        name="artist" 
                        value={formData.artist} 
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-white/20 pb-3 text-lg focus:border-[#9b5fd6] outline-none transition"
                      >
                        <option value="">Choose from roster...</option>
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
                  <label className="block text-xs tracking-[0.24em] text-white/60 mb-3">YOUR NAME *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent border-b border-white/20 pb-3 text-lg placeholder:text-white/30 focus:border-[#9b5fd6] outline-none" 
                    placeholder="Alex Rivera" 
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.24em] text-white/60 mb-3">EMAIL *</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent border-b border-white/20 pb-3 text-lg placeholder:text-white/30 focus:border-[#9b5fd6] outline-none" 
                    placeholder="you@company.com" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs tracking-[0.24em] text-white/60 mb-3">DATE (MM / YYYY) *</label>
                  <input 
                    type="text" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleChange}
                    required
                    placeholder="06 / 2026"
                    className="w-full bg-transparent border-b border-white/20 pb-3 text-lg placeholder:text-white/30 focus:border-[#9b5fd6] outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.24em] text-white/60 mb-3">CITY + VENUE</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange}
                    placeholder="CDMX • Foro Indie Rocks"
                    className="w-full bg-transparent border-b border-white/20 pb-3 text-lg placeholder:text-white/30 focus:border-[#9b5fd6] outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="block text-xs tracking-[0.24em] text-white/60 mb-3">CAPACITY</label>
                  <input 
                    type="text" 
                    name="capacity" 
                    value={formData.capacity} 
                    onChange={handleChange}
                    placeholder="800 - 1200" 
                    className="w-full bg-transparent border-b border-white/20 pb-3 text-lg placeholder:text-white/30 focus:border-[#9b5fd6] outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.24em] text-white/60 mb-3">EVENT TYPE</label>
                  <select 
                    name="eventType" 
                    value={formData.eventType} 
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-white/20 pb-3 text-lg focus:border-[#9b5fd6] outline-none text-white/80"
                  >
                    <option value="">Select...</option>
                    <option value="Club Night">Club Night</option>
                    <option value="Festival">Festival</option>
                    <option value="Private">Private Event</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs tracking-[0.24em] text-white/60 mb-3">BUDGET RANGE</label>
                  <select 
                    name="budget" 
                    value={formData.budget} 
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-white/20 pb-3 text-lg focus:border-[#9b5fd6] outline-none text-white/80"
                  >
                    <option value="">Select...</option>
                    <option value="$3,000 - $6,000 USD">$3k – $6k USD</option>
                    <option value="$6,000 - $12,000 USD">$6k – $12k USD</option>
                    <option value="$12,000+ USD">$12k+ USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-[0.24em] text-white/60 mb-3">EVENT NAME / NOTES</label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us more about the vision..."
                  className="w-full bg-transparent border-b border-white/20 pb-3 text-lg placeholder:text-white/30 focus:border-[#9b5fd6] outline-none resize-y" 
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div className="text-[10px] tracking-widest text-white/40 font-mono">ALL FIELDS MARKED * ARE REQUIRED</div>
                
                <motion.button
                  type="submit"
                  disabled={status === 'loading'}
                  className="group flex items-center gap-4 px-10 py-4 bg-white text-black text-xs tracking-[2px] font-medium rounded-full disabled:opacity-70 hover:bg-[#9b5fd6] hover:text-white transition-all active:scale-[0.985]"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.985 }}
                >
                  {status === 'loading' ? 'SENDING...' : status === 'success' ? 'REQUEST RECEIVED ✓' : 'SEND REQUEST'}
                  <span className="group-hover:translate-x-1 transition">↗</span>
                </motion.button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-sm mt-2"
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

export default Booking
