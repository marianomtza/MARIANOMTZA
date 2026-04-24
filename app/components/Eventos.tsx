import React from 'react'

interface Event {
  id: number
  date: string
  city: string
  venue: string
  title: string
  link: string
}

const EVENTS: Event[] = [
  { id: 1, date: 'JUN 2024', city: 'CDMX', venue: 'Cercle Odyssey', title: 'Cercle Odyssey CDMX', link: 'https://www.youtube.com/watch?v=UzPRso975PM' },
  { id: 2, date: 'AGO 2024', city: 'CDMX', venue: 'Lago Algo', title: 'Knockout w/ Vegyn', link: 'https://www.instagram.com/p/DNMhSKwx-uP/' },
  { id: 3, date: 'OCT 2024', city: 'CDMX', venue: 'MUTEK MX', title: 'MUTEK MX x Club Furia x Lapi', link: 'https://mexico.mutek.org/es/eventos/2024/colaboracion-especial-con-club-furia-x-lapi' },
  { id: 4, date: 'NOV 2024', city: 'CDMX', venue: 'Keep Hush', title: 'Keep Hush Sessions', link: 'https://www.youtube.com/playlist?list=PLhON8BygM1nIeGSsda4c5IvGvAbHyMysv' },
]

export const Eventos: React.FC = () => {
  return (
    <section id="eventos" className="section border-t border-[color:var(--line)] bg-[color:var(--surface)] py-24">
      <div className="mx-auto max-w-[1120px] px-6 md:px-12">
        <h2 className="mb-12 text-5xl tracking-tight text-[color:var(--fg)] md:text-6xl">Eventos</h2>

        <div className="divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
          {EVENTS.map((event) => (
            <a key={event.id} href={event.link} target="_blank" rel="noreferrer" className="group grid gap-4 py-8 transition hover:bg-white/[0.02] md:grid-cols-[160px_1fr_auto] md:items-center">
              <div className="text-xs tracking-[0.16em] text-[color:var(--fg-muted)]">{event.date}</div>
              <div>
                <h3 className="text-2xl tracking-tight text-[color:var(--fg)] md:text-3xl">{event.title}</h3>
                <p className="mt-2 text-sm text-[color:var(--fg-muted)]">{event.city} · {event.venue}</p>
              </div>
              <div className="text-xs tracking-[0.14em] text-[color:var(--fg-muted)] group-hover:text-[color:var(--fg)]">OPEN ↗</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
