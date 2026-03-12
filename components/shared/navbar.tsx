import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './logout-button'

export default async function Navbar() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Obtenemos el rol y datos del estudiante (si existe)
  let userProfile = null
  let studentData = null

  if (user) {
    // Obtenemos el rol
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    userProfile = profile

    // Si es estudiante, obtenemos sus datos
    if (profile?.role === 'student') {
      const { data } = await supabase
        .from('students')
        .select('full_name, gamification_levels(name)')
        .eq('id', user.id)
        .single()
      studentData = data
    }
  }

  const isAdmin = userProfile?.role === 'admin'

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-4 border-robles-green shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/icoleorobles.png" alt="Logo" width={45} height={45} className="transition-transform group-hover:rotate-12" />
            <div className="flex flex-col leading-tight">
              <span className="text-2xl font-extrabold text-robles-brown tracking-tight">LeoRobles</span>
              <span className="text-[10px] font-semibold text-robles-green uppercase tracking-widest hidden sm:block">Crear y Crecer</span>
            </div>
          </Link>

          {/* NAVEGACIÓN CENTRAL (Visible solo en escritorio) */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              {isAdmin ? (
                // MENÚ ADMIN
                <>
                  <Link href="/admin" className="text-robles-brown font-bold hover:text-robles-green transition-colors text-lg">
                    Panel Control 🛠️
                  </Link>
                  <Link href="/admin/books" className="text-robles-brown font-bold hover:text-robles-green transition-colors text-lg">
                    Libros 📚
                  </Link>
                  <Link href="/admin/books/new" className="text-robles-brown font-bold hover:text-robles-green transition-colors text-lg">
                    Agregar Libro ➕
                  </Link>
                  <Link href="/catalog" className="text-robles-brown font-bold hover:text-robles-green transition-colors text-lg">
                    Ver Catálogo 🔍
                  </Link>
                </>
              ) : (
                // MENÚ ESTUDIANTE
                <>
                  <Link href="/" className="text-robles-brown font-bold hover:text-robles-green transition-colors text-lg">Inicio 🏠</Link>
                  <Link href="/my-loans" className="text-robles-brown font-bold hover:text-robles-green transition-colors text-lg">Mis Libros 🎒</Link>
                  <Link href="/catalog" className="text-robles-brown font-bold hover:text-robles-green transition-colors text-lg">Explorar 🔍</Link>
                </>
              )}
            </div>
          )}

          {/* DERECHA: Perfil / Logout */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative group">
                <div className="flex items-center gap-2 bg-robles-green-light px-3 py-2 rounded-full cursor-pointer hover:bg-robles-green transition-colors">
                  <div className="w-9 h-9 bg-robles-brown rounded-full flex items-center justify-center text-white text-lg font-bold border-2 border-white shadow">
                    {isAdmin ? '🛡️' : (studentData?.full_name?.charAt(0) || 'U')}
                  </div>
                  <span className="font-bold text-robles-brown-dark hidden md:block">
                    {isAdmin ? 'Bibliotecario' : studentData?.full_name?.split(' ')[0]}
                  </span>
                </div>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                  {!isAdmin && (
                    <Link href="/profile" className="block px-4 py-3 text-robles-brown hover:bg-gray-50 font-semibold">
                      Mi Perfil 👤
                    </Link>
                  )}
                  {isAdmin && (
                     <>
                        <Link href="/admin" className="block px-4 py-3 text-robles-brown hover:bg-gray-50 font-semibold">
                          Panel Control 🛠️
                        </Link>
                        <Link href="/admin/books" className="block px-4 py-3 text-robles-brown hover:bg-gray-50 font-semibold">
                          Libros 📚
                        </Link>
                     </>
                  )}
                  <div className="border-t"></div>
                  <div className="px-4 py-3 hover:bg-red-50">
                    <LogoutButton />
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="bg-robles-green text-white px-6 py-3 rounded-xl font-bold hover:bg-robles-green-dark transition-colors shadow-lg text-lg">
                ¡Entrar! 🚀
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}