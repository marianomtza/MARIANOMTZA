import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useAudio } from '../contexts/AudioContext'
import { useBookingActions, useBookingState } from '../contexts/BookingContext'
import { SITE_CONFIG } from '../constants'
import { ARTIST_NAMES } from '../data/roster'
import { hasSupabaseConfig, supabase } from '../lib/supabase'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_NOTES_LENGTH = 2000
const SERVICE_OPTIONS = ['Booking', 'Producción', 'Dirección creativa', 'Curaduría', 'A&R', 'Management', 'Otro']
const SOCIAL_LINKS = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'spotifyUrl', label: 'Spotify' },
  { key: 'soundcloudUrl', label: 'Soundcloud' },
  { key: 'raUrl', label: 'RA' },
]
const EVENT_TYPE_OPTIONS = ['Festival', 'Club', 'Rave / Warehouse', 'Brand activation', 'Privado', 'Corporativo', 'Otro']
const FORM_STATE = {
  IDLE: 'idle',
  SENDING: 'sending',
  OK: 'ok',
  ERROR: 'error',
}

function getClientTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

function sanitizeText(value) {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/\s+/g, ' ')
}

function validateBookingPayload(payload) {
  if (!payload.name || payload.name.length < 2) {
    return 'Ingresa un nombre válido (mínimo 2 caracteres).'
  }
  if (!EMAIL_REGEX.test(payload.email)) {
    return 'Ingresa un email válido.'
  }
  if (!payload.notes || payload.notes.length < 10) {
    return 'Agrega más contexto en notas (mínimo 10 caracteres).'
  }
  if (payload.notes.length > MAX_NOTES_LENGTH) {
    return `Notas demasiado largas (máximo ${MAX_NOTES_LENGTH} caracteres).`
  }
  if (payload.mode === 'artista' && !payload.artist) {
    return 'Selecciona un artista para continuar.'
  }
  if (payload.mode === 'servicio' && !payload.service) {
    return 'Selecciona un tipo de servicio.'
  }
  return ''
}

export function Booking() {
  const audio = useAudio()
  const sectionRef = useRef(null)
  const venueRef = useRef(null)
  const lastScrollRequestRef = useRef(0)
  const placesListenerRef = useRef(null)
  const autocompleteRef = useRef(null)

  const { selectedArtist, scrollRequest } = useBookingState()
  const { setSelectedArtist, clearSelectedArtist } = useBookingActions()
  const [manualMode, setManualMode] = useState('servicio')
  const [state, setState] = useState(FORM_STATE.IDLE)
  const [err, setErr] = useState('')
  const mode = useMemo(() => (selectedArtist ? 'artista' : manualMode), [manualMode, selectedArtist])

  useEffect(() => {
    if (!venueRef.current) return
    if (!(window.google && window.google.maps && window.google.maps.places)) return

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(venueRef.current, {
        fields: ['name', 'formatted_address', 'geometry'],
        types: ['establishment', 'geocode'],
      })
      placesListenerRef.current = autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace()
        if (venueRef.current) {
          venueRef.current.value = place.formatted_address || place.name || venueRef.current.value || ''
        }
      })
    } catch (_error) {
      autocompleteRef.current = null
    }

    return () => {
      if (placesListenerRef.current?.remove) {
        placesListenerRef.current.remove()
      }
      placesListenerRef.current = null
      autocompleteRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!sectionRef.current) return
    if (scrollRequest <= lastScrollRequestRef.current) return
    lastScrollRequestRef.current = scrollRequest
    sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [scrollRequest])

  const resetForm = useCallback((form) => {
    form.reset()
    clearSelectedArtist()
    if (venueRef.current) {
      venueRef.current.value = ''
    }
  }, [clearSelectedArtist])

  const setModeExplicitly = useCallback((nextMode) => {
    setManualMode(nextMode)
    if (nextMode === 'servicio') {
      clearSelectedArtist()
    }
  }, [clearSelectedArtist])

  const submit = useCallback(async (e) => {
    e.preventDefault()
    if (state === FORM_STATE.SENDING) return

    const form = e.currentTarget
    const data = new FormData(form)

    if (data.get('_gotcha')) {
      setState(FORM_STATE.OK)
      resetForm(form)
      return
    }

    const payload = {
      mode,
      name: sanitizeText(data.get('name')),
      email: sanitizeText(data.get('email')),
      notes: sanitizeText(data.get('notes')),
      artist: sanitizeText(data.get('artist')),
      service: sanitizeText(data.get('service')),
    }

    const validationError = validateBookingPayload(payload)
    if (validationError) {
      setErr(validationError)
      setState(FORM_STATE.ERROR)
      return
    }

    data.set('name', payload.name)
    data.set('email', payload.email)
    data.set('notes', payload.notes)
    if (payload.artist) data.set('artist', payload.artist)
    if (payload.service) data.set('service', payload.service)
    data.append('_mode', mode)
    data.append('_timezone', getClientTimeZone())

    setState(FORM_STATE.SENDING)
    setErr('')
    audio?.click?.()

    if (!hasSupabaseConfig || !supabase) {
      setErr('Booking temporalmente no disponible. Escríbenos por email o WhatsApp.')
      setState(FORM_STATE.ERROR)
      return
    }

    try {
      const bookingRow = {
        mode,
        name: payload.name,
        email: payload.email,
        artist: payload.artist || null,
        service: payload.service || null,
        date_label: sanitizeText(data.get('date')),
        venue: sanitizeText(data.get('venue')) || null,
        capacity: Number(data.get('capacity')) || null,
        event_type: sanitizeText(data.get('eventType')) || null,
        event_name: sanitizeText(data.get('eventName')) || null,
        budget: sanitizeText(data.get('budget')) || null,
        notes: payload.notes,
        timezone: getClientTimeZone(),
        source: 'website',
        status: 'new',
      }

      const { error } = await supabase.from('bookings').insert(bookingRow)
      if (error) throw error

      setState(FORM_STATE.OK)
      resetForm(form)
    } catch (_error) {
      setErr('No se pudo enviar tu solicitud. Intenta de nuevo en un momento.')
      setState(FORM_STATE.ERROR)
    }
  }, [audio, mode, resetForm, state])

  return (
    <section className="section" id="booking" ref={sectionRef}>
      <div className="wrap">
        <div className="booking reveal">
          <div className="booking-left">
            <div className="booking-eyebrow">
              <span className="booking-eyebrow-line" />
              07 — Booking
            </div>
            <h2>
              Reserva tu <span className="ital">noche</span>
            </h2>
            <p className="desc">
              Hablemos de tu próxima noche. Respondo personalmente en &lt; 48h.
            </p>

            <div className="booking-info">
              <div className="binfo-block">
                <span className="label">Booking directo</span>
                <span className="v">
                  <a href={`mailto:${SITE_CONFIG.email}`}>
                    {SITE_CONFIG.email} →
                  </a>
                </span>
              </div>
              {SITE_CONFIG.whatsapp && (
                <div className="binfo-block">
                  <span className="label">WhatsApp</span>
                  <span className="v">
                    <a
                      href={`https://wa.me/${SITE_CONFIG.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {SITE_CONFIG.whatsapp} →
                    </a>
                  </span>
                </div>
              )}
              <div className="binfo-block">
                <span className="label">Base</span>
                <span style={{ fontSize: 15, fontWeight: 400, color: 'var(--fg-dim)' }}>
                  {SITE_CONFIG.city}
                </span>
              </div>
              <div className="binfo-socials">
                {SOCIAL_LINKS.map((social) =>
                  SITE_CONFIG[social.key] ? (
                    <a key={social.key} href={SITE_CONFIG[social.key]} target="_blank" rel="noopener noreferrer">
                      {social.label}
                    </a>
                  ) : null
                )}
              </div>
              <div className="booking-quick-actions">
                <a className="quick-action-btn" href={`mailto:${SITE_CONFIG.email}`}>
                  Email →
                </a>
                {SITE_CONFIG.whatsapp && (
                  <a
                    className="quick-action-btn"
                    href={`https://wa.me/${SITE_CONFIG.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp →
                  </a>
                )}
                {!hasSupabaseConfig && (
                  <span className="note">Setup pendiente: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.</span>
                )}
              </div>
            </div>
          </div>

          <div className="booking-form-wrap">
            <div className="mode-toggle" role="tablist" aria-label="Tipo de booking">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'servicio'}
                className={`mode-btn ${mode === 'servicio' ? 'active' : ''}`}
                onClick={() => {
                  setModeExplicitly('servicio')
                  audio?.click?.()
                }}
              >
                Servicio
              </button>
              <button
                type="button"
                role="tab"
                data-mode="artista"
                aria-selected={mode === 'artista'}
                className={`mode-btn ${mode === 'artista' ? 'active' : ''}`}
                onClick={() => {
                  setModeExplicitly('artista')
                  audio?.click?.()
                }}
              >
                Artista
              </button>
              <span className={`mode-indicator ${mode}`} />
            </div>

            <form className="form" onSubmit={submit}>
              {/* honeypot */}
              <input
                type="text"
                name="_gotcha"
                style={{ display: 'none' }}
                tabIndex="-1"
                autoComplete="off"
              />

              {/* shared fields */}
              <div className="form-row">
                <div className="field">
                  <label>
                    Tu nombre <span className="req">*</span>
                  </label>
                  <input name="name" required minLength={2} maxLength={120} placeholder="Tu nombre o crew" />
                </div>
                <div className="field">
                  <label>
                    Email <span className="req">*</span>
                  </label>
                  <input name="email" required type="email" placeholder="tu@email.com" />
                </div>
              </div>

              {mode === 'artista' && (
                <div className="form-row">
                  <div className="field">
                    <label>Artista a bookear</label>
                    <select
                      name="artist"
                      value={selectedArtist}
                      required={mode === 'artista'}
                      onChange={(e) => setSelectedArtist(e.target.value)}
                    >
                      <option value="" disabled>
                        Selecciona un artista
                      </option>
                      {ARTIST_NAMES.map((artistName) => (
                        <option key={artistName}>{artistName}</option>
                      ))}
                      <option>Otro / No sé aún</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Fecha aproximada</label>
                    <input name="date" type="date" />
                  </div>
                </div>
              )}

              {mode === 'servicio' && (
                <div className="form-row">
                  <div className="field">
                    <label>Tipo de servicio</label>
                    <select name="service" required={mode === 'servicio'} defaultValue="">
                      <option value="" disabled>
                        Booking · Producción · Dirección...
                      </option>
                      {SERVICE_OPTIONS.map((service) => (
                        <option key={service}>{service}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Fecha aprox.</label>
                    <input name="date" placeholder="MM / AAAA" />
                  </div>
                </div>
              )}

              {mode === 'artista' && (
                <>
                  <div className="field">
                    <label>Selección rápida de artista</label>
                    <div className="artist-quick-picks">
                      {ARTIST_NAMES.map((artistName) => (
                        <button
                          key={artistName}
                          type="button"
                          className={`artist-pill ${selectedArtist === artistName ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedArtist(artistName)
                            audio?.click?.()
                          }}
                        >
                          {artistName}
                        </button>
                      ))}
                    </div>
                    {Boolean(selectedArtist) && (
                      <span className="note">Tip: ya preseleccionaste un artista desde los botones.</span>
                    )}
                  </div>
                  <div className="form-row">
                    <div className="field">
                      <label>Ciudad y lugar</label>
                      <input
                        name="venue"
                        ref={venueRef}
                        placeholder="Club, venue o ciudad"
                        autoComplete="off"
                      />
                    </div>
                    <div className="field">
                      <label>Capacidad total</label>
                      <input name="capacity" type="number" min="0" placeholder="Ej: 2000" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field">
                      <label>Tipo de evento</label>
                      <select name="eventType" defaultValue="">
                        <option value="" disabled>
                          Festival · Club · Privado...
                        </option>
                        {EVENT_TYPE_OPTIONS.map((eventType) => (
                          <option key={eventType}>{eventType}</option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>Nombre del evento</label>
                      <input name="eventName" placeholder="Ej: Knockout: Lago Algo" />
                    </div>
                  </div>
                  <div className="field">
                    <label>Presupuesto</label>
                    <input name="budget" placeholder="USD · MXN · rango" />
                  </div>
                </>
              )}

              <div className="field">
                <label>
                  Notas {mode === 'servicio' && <span className="req">*</span>}
                </label>
                <textarea
                  name="notes"
                  required
                  minLength={10}
                  maxLength={MAX_NOTES_LENGTH}
                  placeholder={
                    mode === 'artista'
                      ? 'Contexto, line-up, rider, lo que sea útil'
                      : 'Visión, fechas, presupuesto, artistas en mente...'
                  }
                />
              </div>

              <div className="form-foot">
                <span className="note">Respuesta en &lt; 48h</span>
                <button
                  type="submit"
                  className={`submit-btn ${state === FORM_STATE.OK ? 'ok' : ''}`}
                  onMouseEnter={() => audio?.whoosh?.()}
                  disabled={state === FORM_STATE.SENDING}
                >
                  {state === FORM_STATE.SENDING && 'Enviando…'}
                  {state === FORM_STATE.OK && '✓ Enviado'}
                  {state === FORM_STATE.ERROR && 'Reintentar'}
                  {state === FORM_STATE.IDLE && (
                    <>
                      Enviar <span>→</span>
                    </>
                  )}
                </button>
              </div>
              {state === FORM_STATE.ERROR && <div className="form-err">{err}</div>}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
