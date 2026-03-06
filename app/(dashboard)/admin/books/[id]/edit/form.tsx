'use client'

import { useState } from 'react'
import { updateBook, deleteBook } from '@/app/actions/admin'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function UpdateBookForm({ book }: { book: any }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleUpdate = async (formData: FormData) => {
    const result = await updateBook(formData)
    if (result.success) {
      toast.success("Actualizado", { description: result.message })
    } else {
      toast.error("Error", { description: result.message })
    }
  }

  const handleDelete = async () => {
    if (!confirm(`¿Seguro que quieres dar de baja "${book.title}"? Esta acción no se puede deshacer.`)) return

    setIsDeleting(true)
    const formData = new FormData()
    formData.append('id', book.id)

    const result = await deleteBook(formData)

    // Manejamos el resultado
        if (result.success) {
          toast.success("Eliminado", { description: result.message })
          // Redirigimos manualmente al usuario
          router.push('/admin/books')
          router.refresh()
        } else {
          toast.error("Error", { description: result.message })
          setIsDeleting(false)
        }

  }

  return (
    <form action={handleUpdate} className="space-y-4">
      <input type="hidden" name="id" value={book.id} />

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Título</label>
        <input name="title" defaultValue={book.title} required className="w-full border-2 rounded-xl px-4 py-2 focus:border-robles-green outline-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Autor</label>
          <input name="author" defaultValue={book.author} className="w-full border-2 rounded-xl px-4 py-2" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Género</label>
          <input name="genre" defaultValue={book.genre} className="w-full border-2 rounded-xl px-4 py-2" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">ISBN</label>
          <input name="isbn" defaultValue={book.isbn} className="w-full border-2 rounded-xl px-4 py-2 bg-gray-50" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Copias Totales</label>
          <input name="total_copies" type="number" defaultValue={book.total_copies} min="0" className="w-full border-2 rounded-xl px-4 py-2" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">URL Portada</label>
        <input name="cover_url" defaultValue={book.cover_url} className="w-full border-2 rounded-xl px-4 py-2 text-sm text-gray-500" />
      </div>

      <div className="flex justify-between items-center pt-6 border-t mt-6">
        {/* Botón Eliminar */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl font-semibold text-sm border border-red-200 hover:border-red-400 disabled:opacity-50"
        >
          {isDeleting ? 'Eliminando...' : 'Dar de baja'}
        </button>

        {/* Botón Actualizar */}
        <button type="submit" className="bg-robles-green text-white px-8 py-2 rounded-xl font-bold shadow-lg hover:bg-robles-green-dark transition-colors">
          Guardar Cambios
        </button>
      </div>
    </form>
  )
}