import { createClient } from '@/lib/supabase/server'
import LoanActionButton from '@/components/ui/loan-action-button'
import Link from 'next/link'
import { calculateOverdueDays } from '@/lib/utils'

// Definimos la interfaz para los props, haciendo searchParams opcional
interface AdminLoansPageProps {
  searchParams?: {
    filter?: string;
  };
}

function FilterTab({ label, value, active }: { label: string; value: string; active: string }) {
  const isActive = active === value
  return (
    <Link
      href={`/admin/loans?filter=${value}`}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
        isActive
          ? 'bg-robles-green text-white shadow'
          : 'bg-white text-gray-600 hover:bg-gray-100 border'
      }`}
    >
      {label}
    </Link>
  )
}

export default async function AdminLoansPage({ searchParams }: { searchParams?: { filter?: string } }) {
  const supabase = createClient()

  // Determinamos el filtro activo
  const activeFilter = searchParams?.filter || 'all'

  // 1. Construir consulta base
  let query = supabase
    .from('loans')
    .select(`
      id,
      due_date,
      status,
      created_at,
      students ( full_name, grade ),
      books ( title )
    `)

  // 2. Aplicar filtros según la pestaña activa
  if (activeFilter === 'reserved') {
    query = query.eq('status', 'reserved')
  } else if (activeFilter === 'overdue') {
    // Atrasados: Prestados Y fecha límite ya pasó
    const now = new Date().toISOString()
    query = query.eq('status', 'borrowed').lt('due_date', now)
  } else {
    // "Todos": Mostrar activos (no devueltos ni cancelados)
    query = query.in('status', ['borrowed', 'reserved'])
  }

  const { data: loans } = await query

  // 3. Ordenar en el servidor (ideal para relaciones complejas)
  let sortedLoans = loans || []

  if (activeFilter === 'overdue') {
    // Ordenar por Curso (A-Z)
    sortedLoans.sort((a, b) => {
      const gradeA = (a.students as any)?.grade || 'Z'
      const gradeB = (b.students as any)?.grade || 'Z'
      return gradeA.localeCompare(gradeB)
    })
  } else if (activeFilter === 'reserved') {
    // Ordenar por Título de Libro (A-Z)
    sortedLoans.sort((a, b) => {
      const titleA = (a.books as any)?.title || 'Z'
      const titleB = (b.books as any)?.title || 'Z'
      return titleA.localeCompare(titleB)
    })
  }

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

        {/* --- NUEVO: FILTROS/TABS --- */}
        <div className="flex gap-2 mb-6 border-b pb-4">
                <FilterTab label="Todos" value="all" active={activeFilter} />
                <FilterTab label="🔴 Atrasados" value="overdue" active={activeFilter} />
                <FilterTab label="📦 Reservados" value="reserved" active={activeFilter} />
              </div>

        {sortedLoans.length > 0 ? (
          <div className="bg-white rounded-2xl shadow overflow-hidden border">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-2 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Libro</th>
                  <th className="px-2 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-2 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedLoans.map((loan: any) => {
                  const isReserved = loan.status === 'reserved'
                  const isOverdue = !isReserved && loan.due_date && new Date(loan.due_date) < new Date()
                  const daysOverdue = isOverdue ? calculateOverdueDays(loan.due_date) : 0

                  return (
                    <tr key={loan.id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                      <td className="px-2 py-4">
                        <div className="font-semibold text-gray-800">{loan.books?.title}</div>
                        <div className="text-xs text-gray-500">{loan.students?.full_name}-{loan.students?.grade || 'N/A'}</div>
                      </td>
                      <td className="px-2 py-4 text-center no-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isReserved ? 'bg-yellow-100 text-yellow-800' :
                          isOverdue ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {isReserved ? 'Reservado' : (isOverdue ? 'Atrasado' : 'En Casa')}
                        </span>
                        <div className="text-xs text-gray-500">
                                                {isReserved ? (
                                                  <span className="text-xs text-gray-400 italic">Sin fecha de devolución</span>
                                                ) : (
                                                  <div className="flex flex-col items-center">
                                                    <span className={`text-sm font-bold ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                                                      Devolución: {new Date(loan.due_date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                    {isOverdue && (
                                                      <span className="text-xs text-red-500 font-bold bg-red-200 px-2 rounded-full mt-1">
                                                        +{daysOverdue} días
                                                      </span>
                                                    )}
                                                  </div>
                                                )}

                        </div>
                      </td>

                      <td className="px-2 py-4 text-center">
                        <LoanActionButton loanId={loan.id} status={loan.status} />
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
            <p className="text-gray-500">No hay libros prestados actualmente en esta categoría.</p>
          </div>
        )}
      </div>
    </main>
  )
}

