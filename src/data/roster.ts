export interface Artist {
  id: number
  name: string
  genre: string
  label?: string
  featured?: boolean
  apple?: string
  spotify?: string
  ig?: string
  photo?: string
}

export const ROSTER_ARTISTS: Artist[] = [
  { id: 1, name: '3DELINCUENTES', genre: 'DJ / Producer', featured: true, label: 'LAFAMA', spotify: 'https://open.spotify.com/artist/3delincuentes', ig: 'https://instagram.com/3delincuentes' },
  { id: 2, name: 'RUZZO DOBLEZZ', genre: 'DJ / Producer', featured: true, label: 'LAFAMA', ig: 'https://instagram.com/ruzzodoblezz' },
  { id: 3, name: '8.AM', genre: 'DJ / Producer', featured: true, label: 'LAFAMA', ig: 'https://instagram.com/8.am' },
  { id: 4, name: 'MORROW', genre: 'DJ / Producer', label: 'LAFAMA', ig: 'https://instagram.com/morrow' },
  { id: 5, name: 'BBBARTEX', genre: 'DJ / Producer', label: 'LAFAMA', ig: 'https://instagram.com/bbbbartex' },
  { id: 6, name: 'LEGORRETA', genre: 'DJ / Producer', label: 'LAFAMA', ig: 'https://instagram.com/legorreta' },
  { id: 7, name: 'TBX', genre: 'DJ / Producer', label: 'LAFAMA', ig: 'https://instagram.com/tbx' },
  { id: 8, name: 'NZO', genre: 'DJ / Producer', label: 'LAFAMA', ig: 'https://instagram.com/nzo' },
  { id: 9, name: 'ELAKKKA', genre: 'Producer', label: 'LAFAMA', ig: 'https://instagram.com/elakkka' },
  { id: 10, name: 'MOODJAAS', genre: 'DJ / Producer', label: 'LAFAMA', ig: 'https://instagram.com/moodjaas' },
]
