'use client'

import { useRef } from 'react'
import BookCard from './book-card'

interface Book {
  id: string
  title: string
  cover_url: string | null
  available_copies: number
}

interface BookCarouselProps {
  title: string
  books: Book[]
}

export default function BookCarousel({ title, books }: BookCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="py-4 md:py-6 relative group">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 px-4 md:px-8">
        {title}
      </h2>

      <div className="relative">
        {/* Botones de Flecha (Visibles en hover en desktop) */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start pl-2"
          aria-label="Scroll izquierda"
        >
          <span className="text-3xl text-gray-800">‹</span>
        </button>

        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar px-4 md:px-8 pb-4"
        >
          {books.map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              coverUrl={book.cover_url}
              status={book.available_copies > 0 ? 'available' : 'borrowed'}
            />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-l from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-2"
          aria-label="Scroll derecha"
        >
          <span className="text-3xl text-gray-800">›</span>
        </button>
      </div>
    </section>
  )
}