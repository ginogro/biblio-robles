import { createClient } from '@/lib/supabase/server'
import ReturnButton from '@/components/ui/return-button'
import Link from 'next/link'

export default async function AdminLoansPage() {
  const supabase = createClient()

  // Obtenemos préstamos activos y su info relacionada
  const { data: loans } = await supabase
    .from('loans')
    .select(`
      id,
      due_date,
      status,
      created_at,
      students ( full_name, grade ),
      books ( title, cover_url )
    `)
    .in('status', ['borrowed', 'reserved', 'overdue']) // Excluimos los devueltos
    .order('due_date', { ascending: true })

  return (
    <main className="min-h-screen bg-gray-100 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-robles-brown font-semibold">
            ← Volver al Panel
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2">Gestión de Préstamos</h1>
          <p className="text-gray-500">Libros actualmente prestados o reservados.</p>
        </div>

        {loans && loans.length > 0 ? (
          <div className="bg-white rounded-2xl shadow overflow-hidden border">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Libro</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Alumno</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Fecha Límite</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loans.map((loan: any) => {
                  const isOverdue = new Date(loan.due_date) < new Date()
                  return (
                    <tr key={loan.id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 bg-gray-100 rounded overflow-hidden relative flex-shrink-0">
                             {loan.books?.cover_url ? (
                               <img src={loan.books.cover_url} alt="" className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-gray-300">📖</div>
                             )}
                          </div>
                          <span className="font-semibold text-gray-800 text-sm">{loan.books?.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{loan.students?.full_name}</div>
                        <div className="text-xs text-gray-500">{loan.students?.grade}</div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                         <span className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                           {isOverdue ? '🚨 Atrasado' : new Date(loan.due_date).toLocaleDateString('es-CL')}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                        <ReturnButton loanId={loan.id} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border">
            <span className="text-5xl">✨</span>
            <h3 className="text-xl font-bold text-gray-800 mt-4">¡Todo al día!</h3>
            <p className="text-gray-500">No hay libros prestados actualmente.</p>
          </div>
        )}
      </div>
    </main>
  )
}