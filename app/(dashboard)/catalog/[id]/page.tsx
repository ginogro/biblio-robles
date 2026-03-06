import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import ReserveButton from '@/components/ui/reserve-button'
import Link from 'next/link'

export default async function BookDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // 1. Obtener datos del libro
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !book) {
    notFound() // Muestra página 404 si no existe
  }

  // 2. Obtener libros parecidos (mismo género, excluyendo el actual)
  const { data: relatedBooks } = await supabase
    .from('books')
    .select('id, title, cover_url, available_copies')
    .eq('genre', book.genre)
    .neq('id', book.id)
    .limit(4)

  return (
    <main className="min-h-screen bg-robles-green-light/30">
      {/* Migas de pan (Breadcrumbs) */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <Link href="/" className="text-robles-brown hover:text-robles-green font-semibold text-sm flex items-center gap-1">
          <span>← Volver al catálogo</span>
        </Link>
      </div>

      {/* Tarjeta Principal */}
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden md:flex border border-gray-100">

          {/* Lado Izquierdo: Portada */}
          <div className="md:w-1/3 bg-robles-green-light p-6 flex items-center justify-center">
            <div className="relative w-48 md:w-64 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-4 border-white transform md:rotate-2 hover:rotate-0 transition-transform duration-300">
              {book.cover_url ? (
                <Image
                  src={book.cover_url}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 20vw"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-robles-green to-robles-green-dark flex items-center justify-center p-4 text-center">
                  <span className="text-white font-bold text-2xl">{book.title}</span>
                </div>
              )}
            </div>
          </div>

          {/* Lado Derecho: Información */}
          <div className="md:w-2/3 p-6 md:p-10 flex flex-col justify-between">
            <div>
              {/* Badge de Género */}
              <span className="inline-block bg-robles-accent text-robles-brown-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                {book.genre || 'General'}
              </span>

              <h1 className="text-3xl md:text-4xl font-extrabold text-robles-brown leading-tight mb-2">
                {book.title}
              </h1>

              <p className="text-lg text-robles-green font-semibold mb-6">
                {book.author || 'Autor Desconocido'}
              </p>

              <div className="prose text-gray-600 mb-6 bg-gray-50 p-4 rounded-xl border-l-4 border-robles-green">
                <p className="m-0 text-sm leading-relaxed">
                  {book.description || 'Este libro guarda secretos increíbles esperando ser descubiertos por ti.'}
                </p>
              </div>

              {/* Metadatos extra */}
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                  ISBN: {book.isbn || 'N/A'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${book.available_copies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {book.available_copies > 0 ? `✅ ${book.available_copies} disponibles` : '❌ Agotado'}
                </span>
              </div>
            </div>

            {/* Botón de Acción */}
            <div className="sticky bottom-4 bg-white pt-4 md:pt-0">
              <ReserveButton
                bookId={book.id}
                available={book.available_copies > 0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección "Te puede interesar" */}
      {relatedBooks && relatedBooks.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pb-12">
          <h3 className="text-xl font-bold text-robles-brown mb-4 flex items-center gap-2">
            <span>🌟</span>
            <span>Otros libros de {book.genre}</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedBooks.map((rBook) => (
              <Link href={`/catalog/${rBook.id}`} key={rBook.id} className="group">
                <div className="bg-white rounded-xl p-2 shadow hover:shadow-md transition-shadow border border-transparent group-hover:border-robles-green">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-100 mb-2">
                     {rBook.cover_url ? (
                       <Image src={rBook.cover_url} alt={rBook.title} fill className="object-cover group-hover:scale-105 transition-transform" sizes="20vw" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center bg-robles-green-light">
                         <span className="text-2xl">📖</span>
                       </div>
                     )}
                  </div>
                  <h4 className="font-semibold text-xs text-gray-800 truncate">{rBook.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}