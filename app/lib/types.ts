export type DrawingTool = 'pencil' | 'marker' | 'ink' | 'eraser'

export type Drawing = {
  id: string
  image?: string
  image_url?: string
  thumb_url?: string | null
  full_url?: string
  name: string
  message: string
  tool: DrawingTool
  created_at: string
  updated_at?: string
  source?: 'web' | 'fallback-local'
}

export type DrawingInput = {
  image?: string
  image_url?: string
  thumb_url?: string
  name: string
  message: string
  tool: DrawingTool
}

export type DrawingsResponse = {
  drawings: Drawing[]
  source?: string
  storageKey?: string
  nextOffset?: number
}

export type DrawingPostResponse = Drawing | { error: string; fallback?: string; storageKey?: string }

export type SavedDrawing = Drawing

export type PendingDrawing = {
  id: string
  name: string
  message: string
  tool: DrawingTool
  fullDataUrl: string
  thumbDataUrl: string
  created_at: string
}

export type BookingPayload = {
  name: string
  email: string
  artist: string
  date: string
  city: string
  venue: string
  capacity: string
  event_type: string
  event_name: string
  budget: string
  notes: string
}
