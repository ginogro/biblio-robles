'use client'

import { useState, useRef } from 'react' // Agregamos useRef
import { fetchBookByISBN, searchBooksByTitle } from '@/lib/books-api'
import { addBook } from '@/app/actions/admin'
import { toast } from 'sonner'
import Image from 'next/image'
import { useRouter } from 'next/navigation' // Para redirigir si queremos

// Tipo para los resultados de búsqueda
type SearchResult = {
  title: string;
  author: string;
  cover_url: string;
  isbn: string;
  description: string;
};

export default function NewBookPage() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null) // Referencia al formulario
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '', author: '', isbn: '', genre: '', cover_url: '', copies: '1'
  })

  // --- Función: Buscar y rellenar por ISBN ---
  const handleISBNFetch = async () => {
    if (!formData.isbn) return
    setIsLoading(true)
    const book = await fetchBookByISBN(formData.isbn)
    if (book) {
      setFormData(prev => ({
        ...prev,
        title: book.title,
        author: book.author,
        cover_url: book.cover_url
      }))
      toast.success("¡Datos encontrados!")
    } else {
      toast.error("No se encontró el ISBN.")
    }
    setIsLoading(false)
  }

  // --- Función: Buscar por Título ---
  const handleTitleSearch = async () => {
    if (!formData.title) return
    setIsLoading(true)
    const results = await searchBooksByTitle(formData.title)
    setSearchResults(results)
    if (results.length === 0) toast.error("No se encontraron resultados.")
    setIsLoading(false)
  }

  // --- Función: Seleccionar resultado de búsqueda ---
  const handleSelectResult = (book: SearchResult) => {
    setFormData({
      ...formData,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      cover_url: book.cover_url,
    })
    setSearchResults([])
  }

  // --- NUEVO: Manejar envío del formulario ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // Evitamos el envío por defecto

    setIsLoading(true)
    const formDataObj = new FormData(e.currentTarget) // Capturamos datos del form actual

    // Llamamos a la Server Action
    const result = await addBook(formDataObj)
    setIsLoading(false)

    if (result.success) {
      toast.success("¡Éxito!", { description: result.message })
      // Opcional: Limpiar formulario o redirigir
      setFormData({ title: '', author: '', isbn: '', genre: '', cover_url: '', copies: '1' })
      // router.push('/admin') // Descomenta si quieres volver al panel
    } else {
      toast.error("Error", { description: result.message })
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-8 border border-gray-100">
      <h1 className="text-2xl font-bold text-robles-brown mb-6 flex items-center gap-2">
        <span>➕</span> Agregar Nuevo Libro
      </h1>

      {/* CAMBIO: Usamos onSubmit en lugar de action */}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">

        {/* Sección de Búsqueda Rápida (Igual que antes) */}
        <div className="p-4 bg-robles-green-light rounded-xl border border-robles-green/20 space-y-4">
          <p className="text-sm font-semibold text-robles-green-dark">Busqueda Mágica (Opcional)</p>

          {/* Buscar por ISBN */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ISBN (Ej: 9788420468531)"
              value={formData.isbn}
              onChange={(e) => setFormData({...formData, isbn: e.target.value})}
              className="flex-1 border-gray-300 rounded-lg text-sm px-3 py-2 border focus:ring-robles-green focus:border-robles-green"
            />
            <button type="button" onClick={handleISBNFetch} disabled={isLoading} className="bg-robles-green text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-robles-green-dark disabled:opacity-50">
              {isLoading ? '...' : 'Buscar ISBN'}
            </button>
          </div>

          {/* Buscar por Título */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por nombre del libro..."
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="flex-1 border-gray-300 rounded-lg text-sm px-3 py-2 border focus:ring-robles-green focus:border-robles-green"
            />
            <button type="button" onClick={handleTitleSearch} disabled={isLoading} className="bg-robles-brown text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-robles-brown-dark disabled:opacity-50">
              {isLoading ? '...' : 'Buscar Título'}
            </button>
          </div>

          {/* Resultados de Búsqueda de Título */}
          {searchResults.length > 0 && (
            <div className="mt-4 border rounded-lg overflow-hidden bg-white max-h-60 overflow-y-auto">
              <p className="text-xs bg-gray-100 p-2 font-semibold text-gray-600 sticky top-0">Selecciona una opción:</p>
              <ul className="divide-y">
                {searchResults.map((book, i) => (
                  <li
                    key={i}
                    onClick={() => handleSelectResult(book)}
                    className="flex items-center gap-3 p-3 hover:bg-robles-green-light cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-12 bg-gray-100 relative rounded overflow-hidden flex-shrink-0">
                      {book.cover_url ? (
                        <Image src={book.cover_url} alt="" fill className="object-cover" sizes="32px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">📖</div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">{book.title}</p>
                      <p className="text-xs text-gray-500">{book.author}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Formulario de Datos Finales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">Título *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
              className="w-full border-2 rounded-xl px-4 py-2 focus:border-robles-green outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Autor</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={(e) => setFormData({...formData, author: e.target.value})}
              className="w-full border-2 rounded-xl px-4 py-2 focus:border-robles-green outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Género</label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={(e) => setFormData({...formData, genre: e.target.value})}
              placeholder="Ej: Fantasía"
              className="w-full border-2 rounded-xl px-4 py-2 focus:border-robles-green outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">ISBN (Código)</label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={(e) => setFormData({...formData, isbn: e.target.value})}
              className="w-full border-2 rounded-xl px-4 py-2 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Copias</label>
            <input
              type="number"
              name="copies"
              value={formData.copies}
              onChange={(e) => setFormData({...formData, copies: e.target.value})}
              className="w-full border-2 rounded-xl px-4 py-2"
            />
          </div>

          {/* Hidden field para portada */}
          <input type="hidden" name="cover_url" value={formData.cover_url} />

          {/* Previsualización de Portada */}
          {formData.cover_url && (
            <div className="md:col-span-2 flex justify-center">
              <div className="relative w-24 h-36 rounded-lg overflow-hidden shadow-lg border-4 border-white">
                <Image src={formData.cover_url} alt="Portada" fill className="object-cover" />
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setFormData({ title: '', author: '', isbn: '', genre: '', cover_url: '', copies: '1' })}
            className="px-6 py-2 rounded-xl font-semibold text-gray-600 hover:bg-gray-100"
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-robles-green text-white px-8 py-2 rounded-xl font-bold shadow-lg hover:bg-robles-green-dark transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : 'Guardar Libro'}
          </button>
        </div>
      </form>
    </div>
  )
}