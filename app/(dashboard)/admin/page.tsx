import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const supabase = createClient()

  // Verificación de seguridad básica
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Si por alguna razón un alumno entra aquí, lo sacamos
  if (profile?.role !== 'admin') {
    redirect('/')
  }

  // Estadísticas rápidas para el admin
  const { count: totalBooks } = await supabase.from('books').select('*', { count: 'exact', head: true })
  const { count: activeLoans } = await supabase.from('loans').select('*', { count: 'exact', head: true }).in('status', ['borrowed', 'reserved'])
  const { count: overdueLoans } = await supabase.from('loans').select('*', { count: 'exact', head: true }).eq('status', 'overdue')

  return (
    <main className="min-h-screen bg-gray-100 pb-12">
      {/* Header Admin */}
      <div className="bg-robles-brown text-white py-12 px-4 rounded-b-[3rem] mb-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Panel del Bibliotecario 🛡️</h1>
          <p className="opacity-80">Aquí puedes gestionar la biblioteca y los préstamos.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow border-l-4 border-blue-500">
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Libros en Catálogo</p>
            <p className="text-4xl font-extrabold text-gray-800 mt-2">{totalBooks || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow border-l-4 border-robles-green">
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Préstamos Activos</p>
            <p className="text-4xl font-extrabold text-gray-800 mt-2">{activeLoans || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow border-l-4 border-red-500">
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Con Retraso 🚨</p>
            <p className="text-4xl font-extrabold text-red-600 mt-2">{overdueLoans || 0}</p>
          </div>
        </div>

        {/* Menú de Acciones */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card: Agregar Libro */}
          <Link href="/admin/books/new" className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100 flex flex-col items-center justify-center text-center group hover:border-robles-green">
            <div className="bg-robles-green-light p-4 rounded-full mb-4 group-hover:bg-robles-green transition-colors">
              <span className="text-4xl">➕</span>
            </div>
            <h3 className="font-bold text-lg text-gray-800">Agregar Nuevo Libro</h3>
            <p className="text-sm text-gray-500 mt-1">Busca por ISBN o Título para añadir al catálogo.</p>
          </Link>

          {/* Card: Gestionar Préstamos */}
          <Link href="/admin/loans" className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100 flex flex-col items-center justify-center text-center group hover:border-blue-500">
            <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-500 transition-colors">
              <span className="text-4xl">📚</span>
            </div>
            <h3 className="font-bold text-lg text-gray-800">Gestionar Préstamos</h3>
            <p className="text-sm text-gray-500 mt-1">Ver libros prestados, registrar devoluciones y reservas.</p>
          </Link>

          {/* Card: Gestionar Alumnos (Placeholder) */}
          <Link href="/admin/students" className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100 flex flex-col items-center justify-center text-center group hover:border-purple-500">
            <div className="bg-purple-100 p-4 rounded-full mb-4 group-hover:bg-purple-500 transition-colors">
              <span className="text-4xl">👥</span>
            </div>
            <h3 className="font-bold text-lg text-gray-800">Ver Alumnos</h3>
            <p className="text-sm text-gray-500 mt-1">Lista de usuarios y sus historiales de lectura.</p>
          </Link>

          {/* Card: Reportes (Placeholder) */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 flex flex-col items-center justify-center text-center opacity-60 cursor-not-allowed">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <span className="text-4xl">📊</span>
            </div>
            <h3 className="font-bold text-lg text-gray-800">Reportes</h3>
            <p className="text-sm text-gray-500 mt-1">Próximamente.</p>
          </div>

          {/* Card: Configuración */}
          <Link href="/admin/settings" className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100 flex flex-col items-center justify-center text-center group hover:border-purple-500">
            <div className="bg-gray-100 p-4 rounded-full mb-4 group-hover:bg-gray-200 transition-colors">
              <span className="text-4xl">⚙️</span>
            </div>
            <h3 className="font-bold text-lg text-gray-800">Configuración</h3>
            <p className="text-sm text-gray-500 mt-1">Ajusta días de préstamo y reservas.</p>
          </Link>
        </div>
      </div>
    </main>
  )
}