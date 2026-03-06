'use client'

import Image from 'next/image'
import Link from 'next/link'
import { isExternalImage } from '@/lib/utils' // Importamos la ayuda

interface BookCardProps {
  id: string
  title: string
  coverUrl: string | null
  status: 'available' | 'borrowed' | 'reserved'
}

export default function BookCard({ id, title, coverUrl, status }: BookCardProps) {
  const isAvailable = status === 'available'
  const isValidNextImage = isExternalImage(coverUrl)

  return (
    <Link href={`/catalog/${id}`} className="flex-shrink-0 w-32 md:w-40 book-card relative group cursor-pointer">
      <div className={`
        relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg bg-gray-200
        ${!isAvailable ? 'opacity-60' : ''}
      `}>

        {coverUrl ? (
          isValidNextImage ? (
            // CASO SEGURO: Usamos Image de Next.js
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 20vw"
            />
          ) : (
            // CASO INSEGURO: Usamos etiqueta img normal (no se rompe, pero no optimiza)
            <img
              src={coverUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          )
        ) : (
          // CASO SIN IMAGEN: Placeholder
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center p-2 text-center">
            <span className="text-white font-bold text-sm">{title}</span>
          </div>
        )}

        {!isAvailable && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-bold shadow">
            OCUPADO
          </div>
        )}
      </div>

      <h3 className="mt-2 text-sm font-medium text-gray-800 truncate">{title}</h3>
    </Link>
  )
}