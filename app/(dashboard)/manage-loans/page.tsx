import { createClient } from '@/lib/supabase/server'
import ReturnButton from '@/components/ui/return-button'

export default async function ManageLoansPage() {
  const supabase = createClient()

  // Obtener préstamos activos (ejemplo simple)
  const { data: loans } = await supabase
    .from('loans')
    .select(`id, created_at, students(full_name), books(title)`)
    .eq('status', 'borrowed')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Libros Prestados</h1>
      <table className="w-full bg-white rounded-lg shadow">
        <tbody>
          {loans?.map((loan: any) => (
            <tr key={loan.id} className="border-b flex justify-between items-center p-4">
              <div>
                <p className="font-bold">{loan.books.title}</p>
                <p className="text-sm text-gray-500">Alumno: {loan.students.full_name}</p>
              </div>

              {/* AQUI VA TU BOTÓN */}
              <ReturnButton loanId={loan.id} />

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}