// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Importante: Refresca la sesión si ha expirado
  await supabase.auth.getSession()

  // Lógica de Protección de Rutas
  const { data: { session } } = await supabase.auth.getSession()
  const url = request.nextUrl

  // 1. Si no hay sesión y trata de acceder al dashboard -> Redirigir a Login
  if (!session && url.pathname.startsWith('/dashboard') && url.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Si HAY sesión y trata de acceder a Login -> Redirigir al Inicio
  if (session && url.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto las que empiezan con:
     * - _next/static (archivos estáticos)
     * - _next/image (archivos de optimización de imagen)
     * - favicon.ico (favicon)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}