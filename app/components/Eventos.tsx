import React from 'react'

interface EventItem {
  id: number
  date: string
  city: string
  venue: string
  title: string
  link: string
}

const EVENTS: EventItem[] = [
  { id: 1, date: '2024-03-16', city: 'CDMX', venue: 'Cercle Odyssey', title: 'Cercle Odyssey', link: 'https://www.youtube.com/watch?v=UzPRso975PM' },
  { id: 2, date: '2024-05-24', city: 'CDMX', venue: 'Lago Algo', title: 'Knockout w/ Vegyn', link: 'https://www.instagram.com/p/DNMhSKwx-uP/' },
  { id: 3, date: '2024-10-13', city: 'CDMX', venue: 'MUTEK MX', title: 'MUTEK x Club Furia x Lapi', link: 'https://mexico.mutek.org/es/eventos/2024/colaboracion-especial-con-club-furia-x-lapi' },
  { id: 4, date: '2024-11-02', city: 'CDMX', venue: 'Keep Hush', title: 'Keep Hush Series', link: 'https://www.youtube.com/playlist?list=PLhON8BygM1nIeGSsda4c5IvGvAbHyMysv' },
]

const formatDate = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()

export const Eventos: React.FC = () => {
  return (
    <section id="eventos" className="section border-t border-[var(--line)] py-24">
      <div className="mx-auto max-w-[1120px] px-6 md:px-12">
        <h2 className="mb-12 text-[44px] font-semibold tracking-tight">Eventos</h2>

        <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {EVENTS.map((event) => (
            <a key={event.id} href={event.link} target="_blank" rel="noopener noreferrer" className="group grid gap-3 py-7 md:grid-cols-[170px_1fr_220px] md:items-center">
              <p className="font-mono text-xs tracking-[0.2em] text-[var(--fg-dim)]">{formatDate(event.date)}</p>
              <h3 className="text-2xl font-medium tracking-tight transition-colors group-hover:text-[var(--muted-accent)]">{event.title}</h3>
              <p className="text-sm text-[var(--fg-dim)] md:text-right">{event.city} · {event.venue}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
