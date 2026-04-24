import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-10">
        <p className="font-mono text-xs tracking-[0.24em] text-[var(--fg-dim)]">ERROR 404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Sin señal, pero con ritmo.</h1>
        <p className="mt-4 text-[var(--fg-dim)]">Esta ruta no existe. Volvamos al roster para seguir el viaje.</p>
        <Link href="/" className="btn btn-primary mt-8 inline-flex">
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
