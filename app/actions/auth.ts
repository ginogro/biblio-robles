// app/actions/auth.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function loginWithSchoolId(formData: FormData) {
  const supabase = createClient()

  const schoolId = formData.get('school_id') as string
  const password = formData.get('password') as string

  // 1. Construir el email "interno" basado en el ID escolar
  // Esto mantiene la privacidad: no guardamos emails reales, pero Supabase Auth necesita uno.
  const email = `${schoolId.toLowerCase()}@leoapp.internal`

  // 2. Intentar登录
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // En una app real, usarías un sistema de "toast" o redirección con error.
    console.error('Error de login:', error)
    // Redirigimos de vuelta al login con un mensaje de error simple
    // (Aquí usamos redirect para refrescar la página, pero podrías pasar query params)
    redirect('/login?error=Credenciales incorrectas')
  }

  // 3. Éxito: Revalidar y redirigir al Home
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}