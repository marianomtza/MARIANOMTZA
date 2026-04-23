import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mariano Martínez — Eventos y Experiencias Sonoras',
  description: 'Productor de eventos y experiencias sonoras en Ciudad de México',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-black text-white overflow-hidden">
        {children}
      </body>
    </html>
  )
}
