import { createClient } from '@/lib/supabase/server'
import BookCarousel from '@/components/ui/book-carousel'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = createClient()

  // 1. Obtener usuario para saludo personalizado
  const { data: { user } } = await supabase.auth.getUser()
  let studentName = null
  if (user) {
    const { data } = await supabase
      .from('students')
      .select('full_name')
      .eq('id', user.id)
      .single()
    // Solo mostramos el primer nombre para ser más cercanos
    studentName = data?.full_name?.split(' ')[0]
  }

  // 2. Obtener libros (Catálogo)
  const { data: books } = await supabase
    .from('books')
    .select('id, title, cover_url, available_copies, genre')
    .order('title', { ascending: true })

  // 3. Agrupar por género
  const genres: Record<string, typeof books> = {}
  books?.forEach(book => {
    const genre = book.genre || 'General'
    if (!genres[genre]) genres[genre] = []
    genres[genre].push(book)
  })

  return (
    <main className="min-h-screen bg-robles-green-light/30">

      {/* HERO SECTION - Bienvenida animada */}
      <div className="bg-gradient-to-r from-robles-green to-robles-green-dark text-white py-12 px-4 md:px-8 mb-8 rounded-b-[3rem] shadow-lg relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="text-3xl md:text-5xl font-extrabold mb-3 drop-shadow-md tracking-tight">
            {studentName ? (
              <Link href="/profile" className="hover:text-robles-accent transition-colors cursor-pointer">
                ¡Hola, {studentName}! 👋
              </Link>
            ) : (
              '¡Bienvenido a LeoRobles! 🌳'
            )}
          </div>
          <p className="text-base md:text-xl opacity-90 font-semibold mb-6">
            {studentName
              ? '¿Qué aventura vas a leer hoy?'
              : 'Explora historias mágicas y crece con nosotros.'}
          </p>

          {/* Botón de acción si no está logueado */}
          {!studentName && (
            <Link href="/login" className="inline-block bg-white text-robles-green font-bold px-8 py-3 rounded-full shadow-md hover:scale-105 transition-transform text-lg">
              ¡Comenzar Aventura!
            </Link>
          )}
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto pb-12">

        {/* Carrusel de Recomendados */}
        {books && books.length > 0 && (
          <div className="mb-8">
            <BookCarousel title="⭐ Nuevos Favoritos" books={books.slice(0, 10)} />
          </div>
        )}

        {/* Carruseles por Género */}
        {Object.entries(genres).map(([genre, genreBooks]) => (
          <div key={genre} className="mb-8">
            <BookCarousel title={genre} books={genreBooks} />
          </div>
        ))}

        {/* Mensaje si no hay libros */}
        {(!books || books.length === 0) && (
          <div className="text-center py-20">
            <span className="text-6xl">📚</span>
            <h3 className="text-2xl font-bold text-robles-brown mt-4">Aún no hay libros</h3>
            <p className="text-gray-500 mt-2">Muy pronto agregaremos nuevas historias.</p>
          </div>
        )}
      </div>
    </main>
  )
}