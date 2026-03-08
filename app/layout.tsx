import type { Metadata, Viewport } from 'next' // Importamos Viewport
import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({ subsets: ['latin'], weight: ['400', '600', '700', '800'] })

// Metadata para SEO y PWA
export const metadata: Metadata = {
  title: 'LeoRobles - Biblioteca Escolar',
  description: 'Crea y Crece con la lectura',
  manifest: '/manifest.webmanifest', // Next.js genera esto automáticamente, pero es bueno declararlo
  icons: {
    icon: '/logo512.png',
    apple: '/logo512.png', // Importante para iOS
  },
}

// Configuración para móviles (PWA)
export const viewport: Viewport = {
  themeColor: '#4CAF50', // Color de la barra superior en Android
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Opcional: evita zoom accidental en niños
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={nunito.className}>{children}</body>
    </html>
  )
}