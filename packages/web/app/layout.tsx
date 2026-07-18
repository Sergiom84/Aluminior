import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aluminior',
  description: 'Gestión para carpintería de aluminio y PVC',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
