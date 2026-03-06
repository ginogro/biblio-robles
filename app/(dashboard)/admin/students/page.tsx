import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface StudentsPageProps {
  searchParams: {
    q?: string
  }
}

export default async function AdminStudentsPage({ searchParams }: StudentsPageProps) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const query = searchParams.q || ''

  // 1. Obtener alumnos con sus datos de gamificación y conteo de préstamos activos
  const { data: students } = await supabase
    .from('students')
    .select(`
      id,
      school_id,
      full_name,
      grade,
      current_points,
      gamification_levels ( name ),
      loans!inner(id)
    `)
    // Filtro de búsqueda por nombre o ID
    .or(`full_name.ilike.%${query}%,school_id.ilike.%${query}%`)
    // Ordenar por curso y luego nombre
    .order('grade')
    .order('full_name')

  // Nota: El conteo de loans arriba es solo para activos, lo haremos más preciso abajo
  // Para simplificar y evitar errores de sintaxis compleja en Supabase v2,
  // obtendremos los préstamos activos por separado o usaremos una función RPC si fuera crítico.
  // Por ahora, mostraremos los datos principales.

  // Obtenemos conteo real de préstamos activos manualmente para mostrar en la tarjeta
  const studentsWithLoans = await Promise.all((students || []).map(async (student) => {
    const { count } = await supabase
      .from('loans')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', student.id)
      .in('status', ['borrowed', 'reserved'])

    return { ...student, activeLoans: count || 0 }
  }))

  return (
    <main className="min-h-screen bg-gray-100 pb-12">
      {/* Header */}
      <div className="bg-robles-brown text-white py-12 px-4 rounded-b-[3rem] mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Link href="/admin" className="text-xs opacity-70 hover:underline mb-2 block">&larr; Volver al Panel</Link>
              <h1 className="text-3xl md:text-4xl font-extrabold">Directorio de Alumnos 👥</h1>
              <p className="opacity-80 mt-1">Busca y revisa el estado de los lectores.</p>
            </div>

            {/* Buscador */}
            <form method="GET" className="w-full md:w-64">
              <div className="relative">
                <input
                  type="text"
                  name="q"
                  placeholder="Buscar por nombre o ID..."
                  defaultValue={query}
                  className="w-full px-4 py-2 rounded-xl text-gray-800 focus:ring-2 focus:ring-robles-green outline-none"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-robles-green">
                  🔍
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas */}
      <div className="max-w-6xl mx-auto px-4">
        {studentsWithLoans.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentsWithLoans.map((student: any) => (
              <div key={student.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow flex flex-col justify-between">

                <div className="flex items-start gap-4 mb-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 bg-robles-green-light rounded-full flex items-center justify-center text-robles-brown text-2xl font-bold border-2 border-white shadow flex-shrink-0">
                    {student.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-robles-brown truncate">{student.full_name}</h3>
                    <p className="text-sm text-gray-500">{student.grade}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">ID: {student.school_id}</p>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-2 gap-2 text-center mb-4">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-2xl font-bold text-robles-green">{student.current_points}</p>
                    <p className="text-xs text-gray-500">Puntos</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-2xl font-bold text-blue-600">{student.activeLoans}</p>
                    <p className="text-xs text-gray-500">En préstamo</p>
                  </div>
                </div>

                {/* Nivel */}
                <div className="mt-auto border-t pt-3 flex items-center justify-between">
                   <span className="bg-robles-accent text-robles-brown text-xs font-bold px-3 py-1 rounded-full">
                     ⚡ {(student.gamification_levels as any)?.name || 'Sin Nivel'}
                   </span>

                   {/* Botón ver detalles (Opcional) */}
                   <Link href={`/admin/students/${student.id}`} className="text-sm text-robles-green font-semibold hover:underline">
                     Ver más &rarr;
                   </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border">
            <span className="text-5xl">🔍</span>
            <h3 className="text-xl font-bold text-gray-800 mt-4">No se encontraron alumnos</h3>
            <p className="text-gray-500 mt-1">Prueba con otro término de búsqueda.</p>
          </div>
        )}
      </div>
    </main>
  )
}