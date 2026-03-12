import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { isExternalImage } from '@/lib/utils'

export default async function AdminBooksPage() {
  const supabase = createClient()

  const { data: books } = await supabase
    .from('books')
    .select('id, title, author, genre, total_copies, available_copies, cover_url')
    .order('title', { ascending: true })

  return (
    <main className="min-h-screen bg-gray-100 pb-12">
      <div className="bg-robles-brown text-white py-12 px-4 rounded-b-[3rem] mb-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/admin" className="text-xs opacity-70 hover:underline mb-2 block">&larr; Volver al Panel</Link>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl md:text-4xl font-extrabold">Gestión de Libros 📚</h1>
            <Link href="/admin/books/new" className="bg-robles-green text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-robles-green-dark shadow">
              + Agregar Nuevo
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {books && books.length > 0 ? (
          <div className="bg-white rounded-2xl shadow overflow-hidden border">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Título / Autor</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">

                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">{book.title}</div>
                      <div className="text-xs text-gray-500">{book.author}</div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${book.available_copies > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {book.available_copies} / {book.total_copies}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/books/${book.id}/edit`}
                        className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-gray-200 mr-2"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border">
            <span className="text-5xl">📭</span>
            <h3 className="text-xl font-bold text-gray-800 mt-4">No hay libros en el catálogo</h3>
          </div>
        )}
      </div>
    </main>
  )
}