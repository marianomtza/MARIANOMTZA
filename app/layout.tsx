import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MARIANOMTZA — Roster & Booking',
  description: 'Plataforma curada de artistas, booking y experiencias en Ciudad de México.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" data-theme="noir">
      <body>{children}</body>
    </html>
  )
}
