import Link from 'next/link'

export default function InspiracionPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)] px-6 py-20">
      <div className="max-w-3xl mx-auto border border-[var(--line)] rounded-2xl p-8 md:p-12">
        <h1 className="font-display text-5xl mb-4">INSPIRACIÓN</h1>
        <p className="text-lg text-[var(--fg-muted)] mb-8">Archivo en construcción.</p>
        <Link href="/" className="btn btn-ghost min-h-11">Volver al inicio</Link>
      </div>
    </main>
  )
}
