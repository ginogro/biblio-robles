'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
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

// --- NUEVA FUNCIÓN: AGREGAR ALUMNO ---
export async function addStudent(formData: FormData) {
  const supabase = createClient() // Cliente normal para verificar permisos

  // 1. Verificar seguridad: ¿Quién intenta hacer esto? Debe ser admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, message: 'No tienes permisos para realizar esta acción.' }
  }

  // 2. Obtener datos del formulario
  const schoolId = formData.get('school_id') as string
  const fullName = formData.get('full_name') as string
  const grade = formData.get('grade') as string
  const password = formData.get('password') as string

  if (!schoolId || !fullName || !grade || !password) {
    return { success: false, message: 'Todos los campos son obligatorios.' }
  }

  // 3. Crear usuario en Auth (Usando el cliente Admin)
  const email = `${schoolId.toLowerCase()}@leoapp.internal`

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Confirmar email automáticamente
    user_metadata: { role: 'student' }
  })

  if (authError) {
    console.error(authError)
    return { success: false, message: `Error creando usuario: ${authError.message}` }
  }

  // 4. Crear perfil y datos del estudiante
  const newUserId = authData.user.id

  // Insertar en profiles (el trigger lo hace, pero nos aseguramos con el rol correcto)
  await supabaseAdmin.from('profiles').upsert({ id: newUserId, role: 'student' })

  // Insertar en students
  const { error: studentError } = await supabaseAdmin
    .from('students')
    .insert({
      id: newUserId,
      school_id: schoolId,
      full_name: fullName,
      grade: grade,
      current_points: 0,
      current_level_id: 1,
      current_loan_limit: 1
    })

  if (studentError) {
    console.error(studentError)
    // Si falla la inserción del estudiante, borramos el usuario creado para no dejar basura
    await supabaseAdmin.auth.admin.deleteUser(newUserId)
    return { success: false, message: 'Error al guardar datos del alumno.' }
  }

  revalidatePath('/admin/students')
  return { success: true, message: `¡Alumno ${fullName} creado exitosamente!` }
}

// --- NUEVA FUNCIÓN: ACTUALIZAR LIBRO ---
export async function updateBook(formData: FormData) {
  const supabase = createClient()

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const author = formData.get('author') as string
  const genre = formData.get('genre') as string
  const isbn = formData.get('isbn') as string
  const coverUrl = formData.get('cover_url') as string
  const totalCopies = parseInt(formData.get('total_copies') as string) || 0

  // Lógica simple para calcular disponibles:
  // Obtenemos el libro actual para ver la diferencia
  const { data: currentBook } = await supabase.from('books').select('total_copies, available_copies').eq('id', id).single()

  if (!currentBook) return { success: false, message: 'Libro no encontrado' }

  const difference = totalCopies - currentBook.total_copies
  const newAvailable = currentBook.available_copies + difference

  // No permitir disponibles negativos
  const finalAvailable = Math.max(0, newAvailable)

  const { error } = await supabase
    .from('books')
    .update({
      title,
      author,
      genre,
      isbn: isbn || null,
      cover_url: coverUrl || null,
      total_copies: totalCopies,
      available_copies: finalAvailable
    })
    .eq('id', id)

  if (error) {
    return { success: false, message: `Error: ${error.message}` }
  }

  revalidatePath('/admin/books')
  revalidatePath('/catalog')
  return { success: true, message: 'Libro actualizado correctamente.' }
}

// --- NUEVA FUNCIÓN: ELIMINAR LIBRO (Dar de baja) ---
export async function deleteBook(formData: FormData) {
  const supabase = createClient()
  const id = formData.get('id') as string

  // Verificar si tiene préstamos activos antes de borrar
  const { data: loans } = await supabase
    .from('loans')
    .select('id')
    .eq('book_id', id)
    .in('status', ['borrowed', 'reserved'])
    .limit(1)

  if (loans && loans.length > 0) {
    return { success: false, message: 'No se puede eliminar: tiene préstamos activos.' }
  }

  const { error } = await supabase.from('books').delete().eq('id', id)

  if (error) {
    return { success: false, message: `Error al eliminar: ${error.message}` }
  }

  revalidatePath('/admin/books')
    revalidatePath('/catalog')
    return { success: true, message: 'Libro eliminado correctamente.' }
}