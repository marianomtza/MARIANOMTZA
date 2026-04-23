export type Drawing = {
  id: string
  image: string
  name: string
  message: string
  tool: 'pencil' | 'marker' | 'ink'
  created_at: string
  updated_at?: string
}

export type DrawingInput = Omit<Drawing, 'id' | 'created_at' | 'updated_at'>

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
