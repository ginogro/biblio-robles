// app/actions/loans.ts
'use server'

import { createClient } from '@/lib/supabase/server'

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