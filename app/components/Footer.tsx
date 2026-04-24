'use client'

import React from 'react'
import Link from 'next/link'

const CONTACT = {
  email: 'hola@marianomtza.com',
  whatsapp: 'https://wa.me/524434264931',
}

export const Footer: React.FC = () => {
  return (
    <footer id="contacto" className="border-t border-[var(--line)] bg-[var(--bg)]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-20 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-7">
          <div className="font-mono text-[11px] tracking-[0.28em] text-[var(--accent)] mb-6 uppercase">· CDMX · 2026</div>
          <div className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.92] tracking-[-0.02em] text-[var(--fg)] mb-8">
            ¿Listo para <br />
            la próxima noche?
          </div>
          <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
            <a href={`mailto:${CONTACT.email}`} className="btn btn-primary min-h-11 justify-between">
              <span>{CONTACT.email}</span>
              <span aria-hidden>↗</span>
            </a>
            <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" className="btn btn-ghost min-h-11 justify-between">
              <span>WhatsApp</span>
              <span aria-hidden>↗</span>
            </a>
          </div>
        </div>

        <nav className="md:col-span-5 flex flex-col gap-6 md:items-end text-sm">
          <div className="flex flex-col gap-2 md:items-end">
            <div className="font-mono text-[10px] tracking-[0.28em] text-[var(--fg-muted)] uppercase mb-1">Navegar</div>
            <Link href="#artistas" className="link-underline text-[var(--fg)]">Roster</Link>
            <Link href="#eventos" className="link-underline text-[var(--fg)]">Eventos</Link>
            <Link href="#reserva" className="link-underline text-[var(--fg)]">Booking</Link>
            <Link href="/inspiracion" className="link-underline text-[var(--fg)]">INSPIRACIÓN</Link>
            <button
              aria-label="Activar señal oculta"
              onClick={() => window.dispatchEvent(new CustomEvent('mmtza-party'))}
              className="text-[var(--fg-muted)] text-xs hover:text-[var(--accent)] transition"
            >
              ✦ hay señales escondidas
            </button>
          </div>
        </nav>
      </div>

      <div className="border-t border-[var(--line)]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-6 flex flex-wrap items-center justify-between gap-4">
          <div className="font-mono text-[10px] tracking-[0.28em] text-[var(--fg-muted)] uppercase">© MARIANOMTZA · 2026</div>
          <div className="font-mono text-[10px] tracking-[0.28em] text-[var(--fg-muted)] uppercase">Ciudad de México</div>
        </div>
      </div>
    </footer>
  )
}
