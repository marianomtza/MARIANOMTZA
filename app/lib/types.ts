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
