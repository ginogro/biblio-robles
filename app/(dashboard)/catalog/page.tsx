import { createClient } from '@/lib/supabase/server'
import BookCard from '@/components/ui/book-card'
import Link from 'next/link'

// Definimos los parámetros de búsqueda (URL)
interface CatalogPageProps {
  searchParams: {
    q?: string
    genre?: string
  }
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const supabase = createClient()

  const query = searchParams.q || ''
  const selectedGenre = searchParams.genre || ''

  // 1. Construir la consulta base
  let booksQuery = supabase
    .from('books')
    .select('id, title, cover_url, available_copies, genre')
    .order('title', { ascending: true })

  // 2. Aplicar filtros si existen
  if (query) {
    booksQuery = booksQuery.ilike('title', `%${query}%`) // Búsqueda insensible a mayúsculas
  }
  if (selectedGenre) {
    booksQuery = booksQuery.eq('genre', selectedGenre)
  }

  const { data: books } = await booksQuery

  // 3. Obtener todos los géneros únicos para los botones de filtro
  // (Hacemos una consulta separada simple para obtener todos los géneros disponibles)
  const { data: allBooks } = await supabase.from('books').select('genre')
  const genres = Array.from(new Set(allBooks?.map(b => b.genre).filter(Boolean)))

  return (
    <main className="min-h-screen bg-robles-green-light/30 pb-16">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Encabezado y Buscador */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-robles-brown flex items-center gap-3">
              <span>🔍</span> Explorar Catálogo
            </h1>
            <p className="text-gray-500 mt-1">Encuentra tu próxima aventura.</p>
          </div>

          {/* Barra de búsqueda (Server Action nativo de HTML) */}
          <form action="/catalog" method="GET" className="w-full md:w-64">
            <div className="relative">
              <input
                type="text"
                name="q"
                placeholder="Buscar por título..."
                defaultValue={query}
                className="w-full pl-4 pr-10 py-3 rounded-2xl border-2 border-gray-200 focus:border-robles-green focus:outline-none font-semibold shadow-sm text-gray-700"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-robles-green hover:text-robles-green-dark">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </div>
            {/* Mantenemos el filtro de género oculto si ya estaba seleccionado */}
            {selectedGenre && <input type="hidden" name="genre" value={selectedGenre} />}
          </form>
        </div>

        {/* Filtros de Género (Chips) */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href={`/catalog${query ? `?q=${query}` : ''}`}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all border-2 ${!selectedGenre ? 'bg-robles-green text-white border-robles-green' : 'bg-white text-gray-600 border-gray-200 hover:border-robles-green'}`}
          >
            Todos
          </Link>

          {genres.map((genre) => (
            <Link
              key={genre}
              href={`/catalog?genre=${genre}${query ? `&q=${query}` : ''}`}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all border-2 ${selectedGenre === genre ? 'bg-robles-green text-white border-robles-green' : 'bg-white text-gray-600 border-gray-200 hover:border-robles-green'}`}
            >
              {genre}
            </Link>
          ))}
        </div>

        {/* Resultados: Grid de Libros */}
        {books && books.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
        ) : (
          <div className="text-center py-20">
            <span className="text-6xl">🔎</span>
            <h3 className="text-2xl font-bold text-robles-brown mt-4">No encontramos libros</h3>
            <p className="text-gray-500 mt-2">Prueba con otro nombre o quita los filtros.</p>
            <Link href="/catalog" className="mt-4 inline-block text-robles-green font-bold hover:underline">
              Ver todo el catálogo
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}