/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'covers.openlibrary.org',
          pathname: '/b/isbn/**', // Para búsqueda por ISBN
        },
        {
          protocol: 'https',
          hostname: 'covers.openlibrary.org',
          pathname: '/b/id/**', // Para búsqueda por Título (ID de portada)
        },
      ],
    },
  }

module.exports = nextConfig