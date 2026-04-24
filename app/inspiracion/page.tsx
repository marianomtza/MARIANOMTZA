import Link from 'next/link'

export default function InspiracionPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-6 py-16 text-[var(--fg)] md:px-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-5xl">INSPIRACIÓN</h1>
        <p className="mt-4 text-[var(--fg-muted)]">Archivo en construcción.</p>
        <Link href="/" className="btn btn-ghost mt-8 inline-flex min-h-11 items-center">
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
