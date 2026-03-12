'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getSetting } from '@/lib/data'

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export async function reserveBook(bookId: string) {
  const supabase = createClient()

  // Llamamos a la función RPC 'process_loan' que definimos en SQL
  const { data, error } = await supabase.rpc('process_loan', {
    book_id_input: bookId
  })

  if (error) {
    console.error(error)
    return { success: false, message: 'Error de conexión.' }
  }

  // La función SQL devuelve un JSON con { success, message }
  return data;
}

export async function returnBook(loanId: string) {
  const supabase = createClient()

  // Verificar rol de admin (RLS lo hace, pero doble check en server action es bueno)
  const { data: { user } } = await supabase.auth.getUser()
  // Lógica extra para verificar si es admin si es necesario...

  const { data, error } = await supabase.rpc('process_return', {
    loan_id_input: loanId
  })

  if (error) {
    return { success: false, message: 'Error al procesar devolución.' }
  }

  return data;
}

export async function cancelReservation(loanId: string) {
  const supabase = createClient()

  // Verificar usuario
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'No autenticado' }

  // Ejecutar la función SQL
  const { data, error } = await supabase.rpc('cancel_student_reservation', {
    p_loan_id: loanId
  })

  if (error) {
    return { success: false, message: 'Error al cancelar la reserva.' }
  }

  revalidatePath('/my-loans')
  revalidatePath('/catalog')

  // Devolvemos la respuesta de la función SQL
  return data
}

export async function markAsBorrowed(loanId: string) {
  const supabase = createClient()

  // 1. Limpiar reservas viejas
  await supabase.rpc('expire_old_reservations')

  // 2. Obtener días dinámicamente
  const daysStr = await getSetting('loan_duration_days')
  const days = parseInt(daysStr)

  const dueDate = addDays(new Date(), days)

  const { error } = await supabase
    .from('loans')
    .update({
      status: 'borrowed',
      borrowed_at: new Date().toISOString(),
      due_date: dueDate.toISOString()
    })
    .eq('id', loanId)

  if (error) {
    return { success: false, message: 'Error al actualizar el préstamo.' }
  }

  revalidatePath('/admin/loans')
  return { success: true, message: `Libro entregado. Fecha límite: ${dueDate.toLocaleDateString('es-CL')}.` }

}

