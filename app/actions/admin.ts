'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addBook(formData: FormData) {
  const supabase = createClient()

  // 1. Extraer datos y limpiar espacios
  let title = (formData.get('title') as string)?.trim()
  let author = (formData.get('author') as string)?.trim()
  let isbn = (formData.get('isbn') as string)?.trim()
  let genre = (formData.get('genre') as string)?.trim()
  let coverUrl = (formData.get('cover_url') as string)?.trim()
  let copies = parseInt(formData.get('copies') as string) || 1

  if (!title) {
    return { success: false, message: 'El título es obligatorio' }
  }

  // IMPORTANTE: Convertir strings vacíos a NULL.
  // Esto evita errores de "Unique Violation" si intentas guardar dos libros sin ISBN.
  // La base de datos permite múltiples NULLs, pero no múltiples "".
  const isbnValue = isbn === '' ? null : isbn;

  // 2. Insertar en Supabase
  const { data, error } = await supabase
    .from('books')
    .insert({
      title,
      author: author || null, // También limpiamos autor si está vacío
      isbn: isbnValue,
      genre: genre || null,
      cover_url: coverUrl || null,
      total_copies: copies,
      available_copies: copies
    })
    .select() // Pedimos que devuelva el dato insertado para confirmar

  if (error) {
    console.error('Error detallado de Supabase:', error);
    // Mensaje más amigable si es error de duplicado
    if (error.code === '23505') {
       return { success: false, message: `El ISBN "${isbn}" ya existe en el catálogo.` };
    }
    return { success: false, message: `Error Base de Datos: ${error.message}` }
  }

  // 3. Refrescar caché
  revalidatePath('/catalog')
  revalidatePath('/admin')

  return { success: true, message: `¡Libro "${title}" agregado exitosamente!` }
}