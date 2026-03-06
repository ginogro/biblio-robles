import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // 1. Datos del alumno
  const { data: student, error } = await supabase
    .from('students')
    .select(`
      full_name,
      grade,
      school_id,
      current_points,
      gamification_levels ( name )
    `)
    .eq('id', params.id)
    .single()

  if (error || !student) notFound()

  // 2. Historial de préstamos
  const { data: history } = await supabase
    .from('loans')
    .select(`created_at, status, books ( title )`)
    .eq('student_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-100 pb-12">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/admin/students" className="text-sm text-gray-500 hover:text-robles-brown font-semibold mb-4 block">
          &larr; Volver a la lista
        </Link>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-robles-green rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {student.full_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-robles-brown">{student.full_name}</h1>
              <p className="text-gray-500">{student.grade} | ID: {student.school_id}</p>
            </div>
          </div>

          <div className="flex gap-4 text-center">
             <div className="flex-1 bg-gray-50 p-3 rounded-lg">
               <p className="text-xl font-bold text-robles-green">{student.current_points}</p>
               <p className="text-xs text-gray-500">Puntos Totales</p>
             </div>
             <div className="flex-1 bg-gray-50 p-3 rounded-lg">
               <p className="text-xl font-bold text-robles-accent">{(student.gamification_levels as any)?.name}</p>
               <p className="text-xs text-gray-500">Nivel Actual</p>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Historial de Actividad</h2>

          {history && history.length > 0 ? (
            <ul className="divide-y">
              {history.map((loan: any) => (
                <li key={loan.id || loan.created_at} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{loan.books?.title}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(loan.created_at).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    loan.status === 'returned' ? 'bg-green-100 text-green-700' :
                    loan.status === 'borrowed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {loan.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-400 py-4">Sin actividad registrada.</p>
          )}
        </div>
      </div>
    </main>
  )
}