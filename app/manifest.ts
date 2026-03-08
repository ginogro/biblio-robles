import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LeoRobles - Biblioteca Escolar',
    short_name: 'LeoRobles',
    description: 'Plataforma de lectura para el Colegio Robles',
    start_url: '/', // Inicia en la raíz, el middleware redirige al login si es necesario
    display: 'standalone', // Se ve como app nativa (sin barra de navegador)
    background_color: '#ffffff',
    theme_color: '#4CAF50', // Tu color robles-green
    icons: [
      {
        src: '/logo512.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}