import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mariano Martínez — Eventos y Experiencias Sonoras',
  description: 'Productor de eventos y experiencias sonoras en Ciudad de México',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" data-theme="nocturne">
      <body>
        {children}
      </body>
    </html>
  )
}
