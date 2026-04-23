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
  { id: 1, name: '3DELINCUENTES', genre: 'LIVE SHOW', label: 'LAFAMA', spotify: 'https://open.spotify.com/artist/4pZ6gf5YV5DdZt3f4HDU62', apple: 'https://music.apple.com/mx/artist/3delincuentes/1636574816', ig: 'https://instagram.com/3delincuentes' },
  { id: 2, name: '1702', genre: 'DJ / PRODUCTOR', label: 'LAFAMA', spotify: 'https://open.spotify.com/artist/01qP45vTj8wyA2YllLfzfS', apple: 'https://music.apple.com/mx/artist/1702/1564028915', ig: 'https://instagram.com/17000000000000000000022222.ae/' },
  { id: 3, name: 'Emi Sopa', genre: 'DJ', spotify: 'https://www.youtube.com/watch?v=guMhz-uvEt0', ig: 'https://instagram.com/emisopa/' },
  { id: 4, name: 'RUZZO DOBLEZZ', genre: 'LIVE SHOW', label: 'LAFAMA', spotify: 'https://open.spotify.com/artist/4GK4U1lkvejUHBFsqyv23D', apple: 'https://music.apple.com/mx/artist/ruzzo_doblezz/1488378827', ig: 'https://instagram.com/ruzzo_doblezz/' },
  { id: 5, name: '8.am', genre: 'LIVE SHOW', label: 'LAFAMA', spotify: 'https://open.spotify.com/artist/0IExmfoarrF3Yugnj9Rhl7', apple: 'https://music.apple.com/mx/artist/8-am/1634453007', ig: 'https://instagram.com/8.am___/' },
  { id: 6, name: 'MORROW', genre: 'LIVE SHOW', label: 'LAFAMA', spotify: 'https://open.spotify.com/artist/6xIdQeYrbSdRZEpiY6gYd4', apple: 'https://music.apple.com/mx/artist/morrow/1691419593', ig: 'https://instagram.com/morrow_pa/' },
  { id: 7, name: 'BBBARTEX', genre: 'LIVE SHOW', label: 'LAFAMA', spotify: 'https://open.spotify.com/artist/03HM5sMMzLHphEemDVqJz3', apple: 'https://music.apple.com/mx/artist/bbbartex/1693601534', ig: 'https://instagram.com/bbbartex/' },
  { id: 8, name: 'LEGORRETA', genre: 'DJ / PRODUCTOR', label: 'LAFAMA', spotify: 'https://open.spotify.com/artist/7H7PSOSgC6q5dLbytIl4bV', apple: 'https://music.apple.com/mx/artist/legorreta/813285391', ig: 'https://instagram.com/soylegorretaa/' },
  { id: 9, name: 'TBX', genre: 'DJ / PRODUCTOR', label: 'LAFAMA', spotify: 'https://open.spotify.com/artist/5fU21ZKt2txkO1sEOI5rwp', apple: 'https://music.apple.com/mx/artist/tbx/663433829', ig: 'https://instagram.com/tbx_mx/' },
  { id: 10, name: 'NZO', genre: 'LIVE SHOW', label: 'LAFAMA', spotify: 'https://open.spotify.com/artist/6SWdWsEfebEsNwD1dYKj2d', apple: 'https://music.apple.com/mx/artist/nzo/1502752880', ig: 'https://instagram.com/nzomx/' },
  { id: 11, name: 'ELAKKKA', genre: 'PRODUCTOR', label: 'LAFAMA', spotify: 'https://open.spotify.com/artist/2ovQecRjUZ8mmjcj9hHRLJ', apple: 'https://music.apple.com/mx/artist/elakkka/1755273038', ig: 'https://instagram.com/elakkka/' },
  { id: 12, name: 'MOODJAAS', genre: 'PRODUCTOR', label: 'LAFAMA', spotify: 'https://open.spotify.com/artist/2LdZfa7wgy3DhUcyBgg1Y3', apple: 'https://music.apple.com/mx/artist/moodjaas/1507618808', ig: 'https://instagram.com/el_moodjaas/' },
]

export const ARTIST_NAMES = ROSTER_ARTISTS.map(artist => artist.name)
