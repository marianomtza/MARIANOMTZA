import React, { useEffect, useState } from 'react'

const THEME_KEY = 'marianomtza:theme'

export const Navbar: React.FC = () => {
  const [theme, setTheme] = useState<'noir' | 'ivory'>('noir')

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY) as 'noir' | 'ivory' | null
    const nextTheme = stored ?? 'noir'
    setTheme(nextTheme)
    document.documentElement.dataset.theme = nextTheme
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const toggleTheme = () => {
    const next = theme === 'noir' ? 'ivory' : 'noir'
    setTheme(next)
    document.documentElement.dataset.theme = next
    window.localStorage.setItem(THEME_KEY, next)
  }

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--line)] bg-[var(--nav)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 md:px-12">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="font-mono text-sm tracking-[0.2em] text-[var(--fg)]">
          MARIANOMTZA
        </button>

        <div className="hidden items-center gap-8 text-xs tracking-[0.18em] md:flex">
          <button onClick={() => scrollTo('artistas')}>Roster</button>
          <button onClick={() => scrollTo('eventos')}>Eventos</button>
          <button onClick={() => scrollTo('reserva')}>Booking</button>
        </div>

        <button onClick={toggleTheme} className="rounded-full border border-[var(--line)] px-4 py-2 text-[10px] tracking-[0.18em]">
          {theme === 'noir' ? 'NOIR' : 'IVORY'}
        </button>
      </div>
    </nav>
  )
}
