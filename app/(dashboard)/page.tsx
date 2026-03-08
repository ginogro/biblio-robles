import { createClient } from '@/lib/supabase/server'
import BookCarousel from '@/components/ui/book-carousel'
import Link from 'next/link'

// Definimos el tipo de dato
type Book = {
  id: string
  title: string
  cover_url: string | null
  available_copies: number
  genre: string
  author?: string // Agregamos autor para la búsqueda
}

// Aceptamos parámetros de búsqueda en la URL (?q=...)
export default async function HomePage({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = createClient()
  const query = searchParams.q || ''

  // 1. Obtener usuario
  const { data: { user } } = await supabase.auth.getUser()
  let studentName = null
  if (user) {
    const { data } = await supabase
      .from('students')
      .select('full_name')
      .eq('id', user.id)
      .single()
    studentName = data?.full_name?.split(' ')[0]
  }

  // 2. Lógica de Búsqueda o Catálogo Normal
  let books: Book[] = []
  let genres: Record<string, Book[]> = {}

  if (query) {
    // --- MODO BÚSQUEDA ---
    const { data } = await supabase
      .from('books')
      .select('id, title, cover_url, available_copies, genre, author')
      .or(`title.ilike.%${query}%,author.ilike.%${query}%`) // Busca en título O autor
      .order('title', { ascending: true })

    books = data ?? []
  } else {
    // --- MODO NORMAL (CARRUSELES) ---
    const { data } = await supabase
      .from('books')
      .select('id, title, cover_url, available_copies, genre')
      .order('title', { ascending: true })

    books = data ?? []

    // Agrupar por género
    books.forEach(book => {
      const genre = book.genre || 'General'
      if (!genres[genre]) genres[genre] = []
      genres[genre].push(book)
    })
  }

  return (
    <main className="min-h-screen bg-robles-green-light/30">

      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-robles-green to-robles-green-dark text-white py-12 px-4 md:px-8 mb-8 rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 drop-shadow-md tracking-tight">
            {studentName ? `¡Hola, ${studentName}! 👋` : '¡Bienvenido a LeoRobles! 🌳'}
          </h1>
          <p className="text-base md:text-xl opacity-90 font-semibold mb-6">
            {studentName
              ? '¿Qué aventura vas a leer hoy?'
              : 'Explora historias mágicas y crece con nosotros.'}
          </p>

          {/* --- NUEVO: BARRA DE BÚSQUEDA --- */}
          <form action="/" method="GET" className="max-w-xl mx-auto mb-4">
            <div className="relative flex items-center">
              <input
                type="text"
                name="q"
                placeholder="Buscar por título o autor..."
                defaultValue={query}
                className="w-full px-6 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg text-lg"
              />
              <button
                type="submit"
                className="absolute right-2 bg-robles-green text-white p-2 rounded-full hover:bg-robles-green-dark transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </div>
          </form>
          {/* --- FIN BARRA DE BÚSQUEDA --- */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto pb-12">

        {/* RENDERIZADO CONDICIONAL */}

        {query ? (
          // --- VISTA DE RESULTADOS DE BÚSQUEDA ---
          <section className="px-4 md:px-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-robles-brown">
                Resultados para: "<span className="text-robles-green">{query}</span>"
              </h2>
              <Link href="/" className="text-sm text-gray-500 hover:text-robles-green font-semibold">
                ✕ Limpiar búsqueda
              </Link>
            </div>

            {books.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {books.map((book) => (
                  <Link href={`/catalog/${book.id}`} key={book.id} className="flex-shrink-0 w-full book-card relative group cursor-pointer">
                    <div className={`
                      relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg bg-gray-200
                      ${book.available_copies > 0 ? '' : 'opacity-60'}
                    `}>
                      {book.cover_url ? (
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center p-2 text-center">
                          <span className="text-white font-bold text-sm">{book.title}</span>
                        </div>
                      )}
                      {book.available_copies <= 0 && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-bold shadow">
                          OCUPADO
                        </div>
                      )}
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-800 truncate">{book.title}</h3>
                    {book.author && <p className="text-xs text-gray-500 truncate">{book.author}</p>}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border">
                <span className="text-5xl">🔎</span>
                <h3 className="text-xl font-bold text-gray-800 mt-4">No encontramos resultados</h3>
                <p className="text-gray-500 mt-2">Intenta con otro nombre o revisa el catálogo completo.</p>
                <Link href="/catalog" className="mt-4 inline-block text-robles-green font-bold hover:underline">
                  Ver todo el catálogo
                </Link>
              </div>
            )}
          </section>
        ) : (
          // --- VISTA NORMAL (CARRUSELES) ---
          <>
            {books.length > 0 && (
              <BookCarousel title="⭐ Nuevos Favoritos" books={books.slice(0, 10)} />
            )}

            {Object.entries(genres).map(([genre, genreBooks]) => (
              <BookCarousel key={genre} title={genre} books={genreBooks} />
            ))}
          </>
        )}

      </div>
    </main>
  )
}