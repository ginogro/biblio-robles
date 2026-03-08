import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import LoanActionButton from '@/components/ui/loan-action-button'

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
      students ( full_name ),
      books ( title )
    `)
    .in('status', ['borrowed', 'reserved'])
    .order('created_at', { ascending: true })

  // Función helper para calcular días de atraso
  const getDaysOverdue = (dueDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Resetear hora para comparar solo fechas

    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)

    const diffTime = today.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays > 0 ? diffDays : 0
  }

  return (
    <main className="min-h-screen bg-gray-100 pb-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-robles-brown font-semibold">
            ← Volver al Panel
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2">Gestión de Préstamos</h1>
          <p className="text-gray-500">Libros actualmente reservados o prestados.</p>
        </div>

        {loans && loans.length > 0 ? (
          <div className="bg-white rounded-2xl shadow overflow-hidden border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Libro</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Alumno</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha Límite</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loans.map((loan: any) => {
                    const isBorrowed = loan.status === 'borrowed'
                    const isReserved = loan.status === 'reserved'

                    // Lógica de fechas
                    const dueDate = loan.due_date ? new Date(loan.due_date) : null
                    const daysOverdue = isBorrowed && dueDate ? getDaysOverdue(loan.due_date) : 0
                    const isOverdue = daysOverdue > 0

                    return (
                      <tr key={loan.id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50 hover:bg-red-100' : ''}`}>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-800">{loan.books?.title || 'Libro desconocido'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{loan.students?.full_name}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isReserved ? 'bg-yellow-100 text-yellow-800' :
                            isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {isReserved ? 'Reservado' : (isOverdue ? 'Atrasado' : 'En Casa')}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          {isReserved ? (
                            <span className="text-xs text-gray-400 italic">Sin fecha (retirar primero)</span>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className={`text-sm font-bold ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                                {dueDate?.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                              </span>
                              {isOverdue && (
                                <span className="text-xs text-red-500 font-bold bg-red-200 px-2 rounded-full mt-1">
                                  +{daysOverdue} días
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <LoanActionButton loanId={loan.id} status={loan.status} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
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