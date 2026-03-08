import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const { data: { user } } = await supabase.auth.getUser()
const url = request.nextUrl

  // 1. Si no hay usuario y trata de acceder a rutas protegidas -> Login
  if (!user && (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/catalog') ||
    url.pathname.startsWith('/my-loans') ||
    url.pathname.startsWith('/profile')
  )) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Si HAY usuario
  if (user) {
    // Verificar rol leyendo de la tabla profiles
    // Nota: Esto se hace después de confirmar que el usuario existe
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'

    // Si intenta ir a Login -> Redirigir a su home correspondiente
    if (url.pathname === '/login') {
       if (isAdmin) {
         return NextResponse.redirect(new URL('/admin', request.url))
       } else {
         return NextResponse.redirect(new URL('/', request.url))
       }
    }

    // Si es admin e intenta ir a la raiz "/" -> Mandarlo al panel admin
    if (isAdmin && url.pathname === '/') {
       return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

