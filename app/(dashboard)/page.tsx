import { createClient } from '@/lib/supabase/server'
import BookCarousel from '@/components/ui/book-carousel'

// 1. Definimos el tipo de dato que espera nuestro componente
type Book = {
  id: string
  title: string
  cover_url: string | null
  available_copies: number
  genre: string
}

export default async function HomePage() {
  const supabase = createClient()

  // 2. Obtenemos usuario (código existente)
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

  // 3. Consulta de libros con tipado explícito y manejo de null
  const { data } = await supabase
    .from('books')
    .select('id, title, cover_url, available_copies, genre')
    .order('title', { ascending: true })

  // Si data es null, usamos un array vacío. Esto soluciona el error de Type.
  const books: Book[] = data ?? []

  // 4. Agrupar por género de forma segura
  const genres: Record<string, Book[]> = {}
  books.forEach(book => {
    const genre = book.genre || 'General'
    if (!genres[genre]) genres[genre] = []
    genres[genre].push(book)
  })

  return (
    <main className="min-h-screen bg-robles-green-light/30">

      {/* Hero Section */}
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

          {!studentName && (
            <a href="/login" className="inline-block bg-white text-robles-green font-bold px-8 py-3 rounded-full shadow-md hover:scale-105 transition-transform text-lg">
              ¡Comenzar Aventura!
            </a>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto pb-12">

        {/* Carrusel de Recomendados */}
        {books.length > 0 && (
          <BookCarousel title="⭐ Nuevos Favoritos" books={books.slice(0, 10)} />
        )}

        {/* Carruseles por Género */}
        {Object.entries(genres).map(([genre, genreBooks]) => (
          <BookCarousel key={genre} title={genre} books={genreBooks} />
        ))}

        {/* Mensaje si no hay libros */}
        {books.length === 0 && (
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