'use client'

import Image from 'next/image'
import Link from 'next/link'

interface BookCardProps {
  id: string
  title: string
  coverUrl: string | null
  status: 'available' | 'borrowed' | 'reserved'
}

export default function BookCard({ id, title, coverUrl, status }: BookCardProps) {
  const isAvailable = status === 'available'

  return (
    <Link href={`/catalog/${id}`} className="flex-shrink-0 w-32 md:w-40 book-card relative group cursor-pointer">
      <div className={`
        relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg
        ${!isAvailable ? 'opacity-60' : ''}
      `}>
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 20vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center p-2 text-center">
            <span className="text-white font-bold text-sm">{title}</span>
          </div>
        )}

        {/* Badge de estado (Solo si NO está disponible) */}
        {!isAvailable && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-bold shadow">
            OCUPADO
          </div>
        )}
      </div>

      {/* Título debajo de la portada */}
      <h3 className="mt-2 text-sm font-medium text-gray-800 truncate">{title}</h3>
    </Link>
  )
}