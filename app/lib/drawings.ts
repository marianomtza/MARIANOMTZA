export type DrawingTool = 'pencil' | 'marker' | 'ink' | 'eraser'

export type DrawingPoint = {
  x: number
  y: number
  pressure: number
  t: number
}

export type DrawingStroke = {
  id: string
  tool: DrawingTool
  color: string
  size: number
  opacity: number
  points: DrawingPoint[]
}

export type DrawingRecord = {
  id: string
  image: string
  name: string
  message: string
  tool: DrawingTool
  created_at: string
  status?: 'public' | 'hidden' | 'pending' | 'flagged'
}

export const DRAWING_STORAGE_KEYS = {
  draft: 'mmtza-drawing-draft',
  pending: 'mmtza-pending-drawings',
  local: 'mmtza-local-drawings',
} as const

export const DRAWING_SWATCHES = [
  { hex: '#111111', label: 'Negro tinta' },
  { hex: '#8B5CF6', label: 'Morado MMTZA' },
  { hex: '#3772FF', label: 'Azul eléctrico' },
  { hex: '#DF2935', label: 'Rojo señal' },
  { hex: '#FDCA40', label: 'Amarillo señal' },
  { hex: '#F8F5F0', label: 'Papel' },
] as const

export function sanitizeDrawingText(value: unknown, max: number) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

export function relativeDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'hace un momento'

  const diffMs = Date.now() - date.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'hace un momento'
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `hace ${days} d`
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function stableTiltFromId(id: string) {
  let seed = 0
  for (let i = 0; i < id.length; i += 1) seed = (seed + id.charCodeAt(i) * 17) % 1000
  return ((seed % 21) - 10) / 10
}

export function isSafeDataUrl(image: string) {
  return /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/.test(image)
}
