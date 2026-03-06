import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import UpdateBookForm from './form' // Componente cliente separado para interacción

export default async function EditBookPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !book) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-8 border border-gray-100">
      <div className="mb-6">
        <Link href="/admin/books" className="text-sm text-gray-500 hover:text-robles-brown font-semibold">
          &larr; Volver a la lista
        </Link>
        <h1 className="text-2xl font-bold text-robles-brown mt-2">Editar Libro</h1>
      </div>

      {/* Pasamos los datos iniciales al formulario cliente */}
      <UpdateBookForm book={book} />
    </div>
  )
}