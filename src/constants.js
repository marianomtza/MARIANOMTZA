/**
 * PIANO_SCALE - Diatonic C major scale for MARIANOMTZA (10 letters = 10 notes)
 * Maps each letter to a note from C4 to E5
 */
export const PIANO_SCALE = [
  261.63, // C4 - M
  293.66, // D4 - A
  329.63, // E4 - R
  349.23, // F4 - I
  392.0, // G4 - A
  440.0, // A4 - N
  493.88, // B4 - O
  523.25, // C5 - M
  587.33, // D5 - T
  659.25, // E5 - Z
  // A (repeated) = 293.66
]

/**
 * Site configuration - used across components
 */
export const SITE_CONFIG = {
  email: 'hola@marianomtza.com',
  whatsapp: '',
  city: 'Ciudad de México · MX',
  instagram: 'https://instagram.com/marianomtza',
  spotifyUrl: '',
  soundcloudUrl: '',
  raUrl: '',
  formspreeId: (import.meta.env.VITE_FORMSPREE_ID || '').trim(),
}

/**
 * Navigation items for colectivos and brands
 */
export const COLECTIVOS = [
  { name: 'SEKS', href: 'https://www.instagram.com/seks.gratis/' },
  { name: 'LUDBOY', href: 'https://www.ludboy.com/' },
  { name: 'KNOCKOUT', href: 'https://www.instagram.com/knockout.fm/' },
  { name: 'LA FAMA', href: 'https://www.instagram.com/es.lafama/' },
]

export const MARCAS = [
  { name: 'Spotify' },
  { name: 'Hennessy' },
  { name: 'Bacardí' },
  { name: 'Zacapa' },
]

/**
 * Validate origin for postMessage (security)
 */
export function isValidOrigin(origin) {
  const allowedOrigins = [
    'https://www.marianomtza.com',
    'https://marianomtza.com',
    'http://localhost:5173',
    'http://localhost:3000',
  ]
  return allowedOrigins.includes(origin)
}

/**
 * Validate message schema (security)
 */
export function isValidMessageSchema(data) {
  if (!data || typeof data !== 'object') return false
  const type = data.type
  const validTypes = ['__activate_edit_mode', '__deactivate_edit_mode', '__edit_mode_available', '__edit_mode_set_keys']
  return validTypes.includes(type)
}
