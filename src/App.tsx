import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Tone from 'tone'
import confetti from 'canvas-confetti'
import './App.css'

interface DrawingPoint {
  x: number
  y: number
  color: string
  size: number
}

function App() {
  const [activeSection, setActiveSection] = useState('hero')
  const [isPlaying, setIsPlaying] = useState(false)
  const [synth, setSynth] = useState<Tone.Synth | null>(null)
  const [currentColor, setCurrentColor] = useState('#ffffff')
  const [brushSize, setBrushSize] = useState(4)
  const [isDrawing, setIsDrawing] = useState(false)
  const [bookingSubmitted, setBookingSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    message: ''
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const lastPos = useRef({ x: 0, y: 0 })

  // Initialize Tone.js
  useEffect(() => {
    const newSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 1.2 }
    }).toDestination()
    setSynth(newSynth)
    return () => {
      newSynth.dispose()
    }
  }, [])

  // Navbar scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.5 }
    )

    const sections = document.querySelectorAll('section[id]')
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const bodyRect = document.body.getBoundingClientRect().top
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition - bodyRect - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // Music Dock
  const playNote = (note: string, duration: number = 0.4) => {
    if (synth) {
      synth.triggerAttackRelease(note, duration)
    }
  }

  const toggleMusic = () => {
    if (!isPlaying) {
      // Play a nice chord progression
      const notes = ['C4', 'E4', 'G4', 'B4', 'C5']
      let i = 0
      const interval = setInterval(() => {
        if (i < notes.length) {
          playNote(notes[i], 0.6)
          i++
        } else {
          clearInterval(interval)
          setIsPlaying(false)
        }
      }, 180)
      setIsPlaying(true)
    }
  }

  // Canvas Drawing
  const initCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = 800
    canvas.height = 500
    const ctx = canvas.getContext('2d', { alpha: true })
    if (ctx) {
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.strokeStyle = currentColor
      ctx.lineWidth = brushSize
      ctxRef.current = ctx
      // Dark background
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }

  useEffect(() => {
    initCanvas()
  }, [])

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = currentColor
      ctxRef.current.lineWidth = brushSize
    }
  }, [currentColor, brushSize])

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e)
    lastPos.current = pos
    setIsDrawing(true)

    if (ctxRef.current) {
      ctxRef.current.beginPath()
      ctxRef.current.moveTo(pos.x, pos.y)
    }
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctxRef.current) return

    const pos = getPos(e)
    
    ctxRef.current.lineTo(pos.x, pos.y)
    ctxRef.current.stroke()
    ctxRef.current.beginPath()
    ctxRef.current.moveTo(pos.x, pos.y)
    
    lastPos.current = pos
  }

  const endDrawing = () => {
    setIsDrawing(false)
    if (ctxRef.current) {
      ctxRef.current.closePath()
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (canvas && ctx) {
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }

  const saveDrawing = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const link = document.createElement('a')
      link.download = 'marianomtza-dibujo.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }

  // Booking Form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.date) {
      alert('Por favor completa los campos obligatorios')
      return
    }

    // Simulate sending
    setTimeout(() => {
      setBookingSubmitted(true)
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 }
      })
      
      // Reset form
      setTimeout(() => {
        setFormData({ name: '', email: '', date: '', message: '' })
        setBookingSubmitted(false)
      }, 2500)
    }, 600)
  }

  const artists = [
    { name: "Luna Voss", role: "Visual Artist", img: "https://picsum.photos/id/1011/400/400", desc: "Explorando la luz y la sombra" },
    { name: "Kai Rivera", role: "Sound Designer", img: "https://picsum.photos/id/1027/400/400", desc: "Paisajes sonoros inmersivos" },
    { name: "Sofia Mendez", role: "Digital Sculptor", img: "https://picsum.photos/id/106/400/400", desc: "Formas que respiran" },
    { name: "Diego Sol", role: "Motion Director", img: "https://picsum.photos/id/1074/400/400", desc: "Movimiento como lenguaje" }
  ]

  const events = [
    { date: "15 MAY", title: "Noche de Silencio", location: "Centro Cultural La Cúpula", type: "Exposición" },
    { date: "22 JUN", title: "Resonancias", location: "Museo de Arte Contemporáneo", type: "Performance" },
    { date: "10 JUL", title: "Líneas que Hablan", location: "Galería Espacio Vacío", type: "Taller" }
  ]

  return (
    <div className="bg-[#0a0a0a] text-white overflow-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-black text-xl font-bold">M</span>
            </div>
            <div>
              <div className="font-semibold tracking-[3px] text-lg">MARIANO MTZA</div>
              <div className="text-[10px] text-white/50 -mt-1">ARTISTA MULTIDISCIPLINARIO</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-10 text-sm uppercase tracking-[2px]">
            {[
              { label: 'ROSTER', id: 'roster' },
              { label: 'EVENTOS', id: 'eventos' },
              { label: 'DIBUJOS', id: 'dibujos' },
              { label: 'BOOKING', id: 'booking' },
              { label: 'INSPIRACIÓN', id: 'inspiracion' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`hover:text-white transition-colors ${activeSection === item.id ? 'text-white' : 'text-white/60'}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button 
            onClick={toggleMusic}
            className="flex items-center gap-2 px-5 py-2 bg-white text-black text-xs tracking-[2px] hover:bg-white/90 transition-all active:scale-[0.985]"
          >
            {isPlaying ? '♪ PAUSE' : '♪ PLAY MUSIC'}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" className="min-h-screen flex items-center justify-center relative pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] bg-[length:4px_4px]" />
        
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-block px-4 py-1 rounded-full border border-white/20 text-xs tracking-[3px] mb-6">
              CDMX • 2026
            </div>
            
            <h1 className="text-[92px] md:text-[130px] leading-[0.92] font-semibold tracking-tighter mb-4">
              MARIANO<br />MTZA
            </h1>
            
            <p className="text-2xl md:text-3xl text-white/70 max-w-[620px] mx-auto">
              Arte que respira.<br />Sonido que toca.
            </p>
          </motion.div>

          <motion.button
            onClick={() => scrollTo('roster')}
            className="mt-16 group flex items-center gap-3 mx-auto text-sm tracking-[3px] border-b border-white/30 pb-1 hover:border-white transition-all"
            whileHover={{ x: 4 }}
          >
            DESCUBRE EL TRABAJO
            <span className="group-hover:rotate-45 transition-transform">↓</span>
          </motion.button>
        </div>

        {/* Music Dock */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
          {['C4', 'E4', 'G4', 'B4', 'D5'].map((note, i) => (
            <motion.button
              key={i}
              onClick={() => playNote(note, 0.8)}
              whileHover={{ scale: 1.2, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center text-xs hover:bg-white hover:text-black transition-all active:bg-white active:text-black"
            >
              {note}
            </motion.button>
          ))}
        </div>
      </section>

      {/* ROSTER */}
      <section id="roster" className="max-w-7xl mx-auto px-6 py-24 border-t border-white/10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="text-xs tracking-[3px] text-white/50">EL EQUIPO</div>
            <h2 className="text-7xl tracking-tighter">Roster</h2>
          </div>
          <p className="max-w-xs text-white/60">Artistas que colaboran conmigo en proyectos que importan.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {artists.map((artist, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-3xl aspect-[16/11] bg-zinc-950"
            >
              <img 
                src={artist.img} 
                alt={artist.name}
                className="absolute inset-0 w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              
              <div className="absolute bottom-0 left-0 p-8">
                <div className="text-xs tracking-[2px] text-white/50 mb-1">{artist.role}</div>
                <div className="text-5xl font-semibold tracking-tighter">{artist.name}</div>
                <div className="mt-3 text-white/70 max-w-[280px]">{artist.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* EVENTOS */}
      <section id="eventos" className="bg-zinc-950 py-24 border-y border-white/10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-xs tracking-[3px] text-white/50">PRÓXIMAMENTE</div>
            <h2 className="text-7xl tracking-tighter mt-2">Eventos</h2>
          </div>

          <div className="space-y-4">
            {events.map((event, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 12 }}
                className="group flex items-center justify-between border border-white/10 hover:border-white/30 px-10 py-9 rounded-3xl transition-all"
              >
                <div className="flex items-center gap-10">
                  <div className="text-6xl font-mono tracking-tighter text-white/30 group-hover:text-white/70 transition-colors">
                    {event.date}
                  </div>
                  <div>
                    <div className="text-4xl tracking-tight">{event.title}</div>
                    <div className="text-white/50 mt-1">{event.location}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xs px-4 py-1 rounded-full border border-white/20 inline-block">
                    {event.type}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DIBUJOS - INTERACTIVE CANVAS */}
      <section id="dibujos" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <div className="text-xs tracking-[3px] text-white/50">PARA TI</div>
          <h2 className="text-7xl tracking-tighter">Déjame un dibujo</h2>
          <p className="mt-4 text-white/60 max-w-md mx-auto">Usa el lienzo. Cambia de color. Guarda tu creación.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Canvas */}
          <div className="relative flex-1">
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={endDrawing}
                className="touch-none cursor-crosshair bg-black"
              />
            </div>
            
            <div className="absolute -bottom-4 right-6 flex gap-3">
              <button 
                onClick={clearCanvas}
                className="px-6 py-3 text-xs tracking-widest border border-white/20 hover:bg-white hover:text-black transition-all"
              >
                LIMPIAR
              </button>
              <button 
                onClick={saveDrawing}
                className="px-8 py-3 bg-white text-black text-xs tracking-widest hover:bg-white/90 active:scale-[0.985] transition-all"
              >
                GUARDAR PNG
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="w-full lg:w-80 pt-4">
            <div className="sticky top-24 space-y-8">
              <div>
                <div className="text-xs tracking-[2px] mb-4 text-white/50">COLOR</div>
                <div className="flex flex-wrap gap-3">
                  {['#ffffff', '#ff3b5c', '#00f9ff', '#ffd700', '#7c3aed', '#22c55e'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setCurrentColor(color)}
                      className={`w-12 h-12 rounded-2xl border-2 transition-all ${currentColor === color ? 'border-white scale-110' : 'border-white/20'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs tracking-[2px] mb-4 text-white/50">
                  <div>GROSOR</div>
                  <div>{brushSize}px</div>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="18" 
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full accent-white"
                />
              </div>

              <div className="text-[11px] text-white/40 leading-relaxed pt-4 border-t border-white/10">
                Toca o arrastra sobre el lienzo.<br />
                Los dibujos se guardan localmente en tu dispositivo.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section id="booking" className="bg-black py-24 border-y border-white/10">
        <div className="max-w-xl mx-auto px-6 text-center">
          <div className="text-xs tracking-[3px] text-white/50">COLABOREMOS</div>
          <h2 className="text-7xl tracking-tighter mt-3 mb-4">Booking</h2>
          <p className="text-white/60 mb-12">¿Tienes un proyecto en mente? Cuéntame.</p>

          <AnimatePresence mode="wait">
            {!bookingSubmitted ? (
              <motion.form 
                onSubmit={handleBookingSubmit}
                className="space-y-6 text-left"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs tracking-widest block mb-2">NOMBRE</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-transparent border-b border-white/30 py-4 text-xl focus:outline-none focus:border-white placeholder:text-white/30" 
                      placeholder="Tu nombre" 
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-widest block mb-2">EMAIL</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-transparent border-b border-white/30 py-4 text-xl focus:outline-none focus:border-white placeholder:text-white/30" 
                      placeholder="tu@email.com" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs tracking-widest block mb-2">FECHA DESEADA</label>
                  <input 
                    type="date" 
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-transparent border-b border-white/30 py-4 text-xl focus:outline-none focus:border-white text-white/70" 
                  />
                </div>

                <div>
                  <label className="text-xs tracking-widest block mb-2">CUÉNTAME MÁS</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full bg-transparent border-b border-white/30 py-4 text-xl focus:outline-none focus:border-white placeholder:text-white/30 resize-y" 
                    placeholder="Estoy pensando en una instalación sonora para..." 
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full mt-4 py-5 bg-white text-black font-medium tracking-[2px] text-sm hover:bg-white/90 active:bg-white transition-all"
                >
                  ENVIAR SOLICITUD
                </button>
              </motion.form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-16"
              >
                <div className="text-8xl mb-6">✹</div>
                <div className="text-4xl tracking-tight">Gracias. Te contacto pronto.</div>
                <p className="mt-4 text-white/50">Revisa tu correo en las próximas 48 horas.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* INSPIRACIÓN */}
      <section id="inspiracion" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="text-xs tracking-[3px] text-white/50">LO QUE ME MUEVE</div>
          <h2 className="text-7xl tracking-tighter">Inspiración</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map((n) => (
            <motion.div 
              key={n}
              whileHover={{ scale: 1.015 }}
              className="aspect-square overflow-hidden rounded-3xl relative group"
            >
              <img 
                src={`https://picsum.photos/id/${50 + n}/600/600`} 
                alt="" 
                className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-[1200ms]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80" />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-16 text-sm text-white/50 max-w-xs mx-auto">
          “El arte no reproduce lo visible, lo hace visible.” — Paul Klee
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black border-t border-white/10 py-20 text-center text-xs tracking-[2px] text-white/50">
        <div>© {new Date().getFullYear()} MARIANO MTZA — TODOS LOS DERECHOS RESERVADOS</div>
        <div className="mt-2">HECHO CON AMOR Y MUCHA MÚSICA EN CDMX</div>
      </footer>
    </div>
  )
}

export default App
