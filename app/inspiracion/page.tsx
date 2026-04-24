import Link from 'next/link'

export default function InspiracionPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)] px-6 md:px-12 py-24">
      <section className="max-w-3xl mx-auto border border-[var(--line)] rounded-3xl p-8 md:p-12 bg-[var(--bg-elevated)]/50">
        <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-[var(--accent)] mb-4">INSPIRACIÓN</p>
        <h1 className="font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.95] mb-5">Archivo en construcción</h1>
        <p className="text-[var(--fg-muted)] max-w-[48ch] mb-10">
          Este espacio editorial se está curando. Pronto publicaremos referencias, procesos y notas visuales.
        </p>
        <Link href="/" className="btn btn-ghost min-h-11 inline-flex">
          <span>Volver al inicio</span>
          <span aria-hidden>→</span>
        </Link>
      </section>
    </main>
  )
}
