import React, { useEffect, useState } from 'react'

export const Navbar: React.FC = () => {
  const [theme, setTheme] = useState<'nocturne' | 'paper'>('nocturne')

  useEffect(() => {
    const stored = (window.localStorage.getItem('mm_theme') as 'nocturne' | 'paper' | null) || 'nocturne'
    setTheme(stored)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const toggleTheme = () => {
    const next = theme === 'nocturne' ? 'paper' : 'nocturne'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    window.localStorage.setItem('mm_theme', next)
  }

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-[color:var(--line)] bg-[color:var(--surface)]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 md:px-12">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xs tracking-[0.2em] text-[color:var(--fg)]">
          MARIANOMTZA
        </button>

        <div className="hidden items-center gap-8 text-xs tracking-[0.14em] text-[color:var(--fg-muted)] md:flex">
          <button onClick={() => scrollTo('artistas')} className="hover:text-[color:var(--fg)]">Roster</button>
          <button onClick={() => scrollTo('eventos')} className="hover:text-[color:var(--fg)]">Eventos</button>
          <button onClick={() => scrollTo('reserva')} className="hover:text-[color:var(--fg)]">Booking</button>
        </div>

        <button onClick={toggleTheme} className="rounded-full border border-[color:var(--line)] px-3 py-2 text-[10px] tracking-[0.16em] text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]">
          {theme === 'nocturne' ? 'NOCTURNE' : 'PAPER'}
        </button>
      </div>
    </nav>
  )
}
