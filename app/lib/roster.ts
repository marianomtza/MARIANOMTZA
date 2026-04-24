export interface Artist {
  id: number
  name: string
  /** Collective / crew tag (LA FAMA, etc). Optional, only for collective members. */
  crew?: string
  /** Primary role descriptor (DJ, Productor, Show en vivo, etc). */
  role: string
  /** Optional longer descriptor shown inside the expanded view. */
  bio?: string
  spotify?: string
  apple?: string
  set?: string
  instagram: string
}

export const ROSTER_ARTISTS: Artist[] = [
  {
    id: 1,
    name: '3DELINCUENTES',
    role: 'Show en vivo',
    bio: 'Trío mexicano que mezcla hip-hop, reggaetón y sonidos urbanos con una identidad visual y sonora propia.',
    spotify: 'https://open.spotify.com/artist/4pZ6gf5YV5DdZt3f4HDU62',
    apple: 'https://music.apple.com/mx/artist/3delincuentes/1636574816',
    instagram: 'https://www.instagram.com/3delincuentes/',
  },
  {
    id: 2,
    name: '1702',
    role: 'DJ · Productor',
    bio: 'DJ y productor mexicano moviéndose entre house, techno y sonidos más experimentales.',
    spotify: 'https://open.spotify.com/artist/01qP45vTj8wyA2YllLfzfS',
    apple: 'https://music.apple.com/mx/artist/1702/1564028915',
    instagram: 'https://www.instagram.com/1702.ae/',
  },
  {
    id: 3,
    name: 'Emi Sopa',
    role: 'DJ',
    bio: 'Selectora con un arco que va del club al baile más íntimo. Crates bien curados.',
    set: 'https://www.youtube.com/watch?v=guMhz-uvEt0&pp=ygUHRU1JU09QQQ%3D%3D',
    instagram: 'https://www.instagram.com/emisopa/',
  },
  {
    id: 4,
    name: 'RUZZO DOBLEZZ',
    crew: 'LA FAMA',
    role: 'Show en vivo',
    bio: 'Artista en vivo de La Fama con presencia escénica brutal. Show imprescindible para la nueva noche mexicana.',
    spotify: 'https://open.spotify.com/artist/4GK4U1lkvejUHBFsqyv23D',
    apple: 'https://music.apple.com/mx/artist/ruzzo_doblezz/1488378827',
    set: 'https://www.youtube.com/watch?v=l-rqTPRHt78&pp=ygULUkVMSU5LIFNFS1M%3D',
    instagram: 'https://www.instagram.com/ruzzo_doblezz/',
  },
  {
    id: 5,
    name: '8.am',
    crew: 'LA FAMA',
    role: 'Show en vivo',
    spotify: 'https://open.spotify.com/artist/0IExmfoarrF3Yugnj9Rhl7',
    apple: 'https://music.apple.com/mx/artist/8-am/1634453007',
    instagram: 'https://www.instagram.com/8.am___/',
  },
  {
    id: 6,
    name: 'MORROW',
    crew: 'LA FAMA',
    role: 'Show en vivo',
    spotify: 'https://open.spotify.com/artist/6xIdQeYrbSdRZEpiY6gYd4',
    apple: 'https://music.apple.com/mx/artist/morrow/1691419593',
    instagram: 'https://www.instagram.com/morrow_pa/',
  },
  {
    id: 7,
    name: 'BBBARTEX',
    crew: 'LA FAMA',
    role: 'Show en vivo',
    spotify: 'https://open.spotify.com/artist/03HM5sMMzLHphEemDVqJz3',
    apple: 'https://music.apple.com/mx/artist/bbbartex/1693601534',
    instagram: 'https://www.instagram.com/bbbartex/',
  },
  {
    id: 8,
    name: 'LEGORRETA',
    crew: 'LA FAMA',
    role: 'DJ · Productor',
    spotify: 'https://open.spotify.com/artist/7H7PSOSgC6q5dLbytIl4bV',
    apple: 'https://music.apple.com/mx/artist/legorreta/813285391',
    instagram: 'https://www.instagram.com/soylegorretaa/',
  },
  {
    id: 9,
    name: 'TBX',
    crew: 'LA FAMA',
    role: 'DJ · Productor',
    spotify: 'https://open.spotify.com/artist/5fU21ZKt2txkO1sEOI5rwp',
    apple: 'https://music.apple.com/mx/artist/tbx/663433829',
    set: 'https://www.youtube.com/watch?v=XCt2G5e5UIY&pp=ygUDVEJY',
    instagram: 'https://www.instagram.com/tbx_mx/',
  },
  {
    id: 10,
    name: 'NZO',
    crew: 'LA FAMA',
    role: 'Show en vivo',
    spotify: 'https://open.spotify.com/artist/6SWdWsEfebEsNwD1dYKj2d',
    apple: 'https://music.apple.com/mx/artist/nzo/1502752880',
    instagram: 'https://www.instagram.com/nzomx/',
  },
  {
    id: 11,
    name: 'ELAKKKA',
    crew: 'LA FAMA',
    role: 'Productor',
    spotify: 'https://open.spotify.com/artist/2ovQecRjUZ8mmjcj9hHRLJ',
    apple: 'https://music.apple.com/mx/artist/elakkka/1755273038',
    instagram: 'https://www.instagram.com/elakkka/',
  },
  {
    id: 12,
    name: 'MOODJAAS',
    crew: 'LA FAMA',
    role: 'Productor',
    spotify: 'https://open.spotify.com/artist/2LdZfa7wgy3DhUcyBgg1Y3',
    apple: 'https://music.apple.com/mx/artist/moodjaas/1507618808',
    instagram: 'https://www.instagram.com/el_moodjaas/',
  },
]

export const ARTIST_NAMES = ROSTER_ARTISTS.map((artist) => artist.name)
