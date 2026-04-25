import React from 'react'
import Link from 'next/link'

export default function InspiracionPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6 text-center">
      <h1 className="font-mono text-[10px] tracking-[0.3em] text-white/30 mb-6">
        INSPIRACIÓN
      </h1>
      <p className="text-white/40 text-sm mb-10">
        Archivo en construcción.
      </p>
      <Link
        href="/"
        className="text-xs font-mono tracking-widest border border-white/15 px-6 py-3 rounded-full
                   text-white/50 hover:border-white/40 hover:text-white transition"
      >
        Volver al inicio
      </Link>
    </main>
  )
}
