import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import CancelReservationButton from '@/components/ui/cancel-reservation-button'

export default async function MyLoansPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Obtener TODOS los préstamos del alumno, ordenados por fecha
  const { data: loans } = await supabase
    .from('loans')
    .select(`
      id,
      status,
      due_date,
      created_at,
      returned_at,
      books (
        id,
        title,
        cover_url,
        author
      )
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  // 2. Separar en listas
  const activeLoans = loans?.filter(l => l.status === 'borrowed' || l.status === 'reserved') || []
  const historyLoans = loans?.filter(l => l.status === 'returned') || []

  // Helper para estado visual
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'borrowed': return { text: 'En Casa', color: 'bg-blue-100 text-blue-700', icon: '📖' }
      case 'reserved': return { text: 'Reservado', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' }
      case 'returned': return { text: 'Devuelto', color: 'bg-green-100 text-green-700', icon: '✅' }
      default: return { text: status, color: 'bg-gray-100 text-gray-700', icon: '❓' }
    }
  }

  return (
    <main className="min-h-screen bg-robles-green-light/30 pb-16">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Encabezado */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-robles-brown hover:text-robles-green font-semibold flex items-center gap-1 mb-4">
            <span>← Volver</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-robles-brown flex items-center gap-3">
            <span>📚</span> Mis Préstamos
          </h1>
          <p className="text-gray-500 mt-1">Aquí puedes ver los libros que tienes y tu historial.</p>
        </div>

        {/* SECCIÓN 1: Libros Actuales */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-robles-brown mb-4 border-b-2 border-robles-green pb-2 inline-block">
            En mi poder ({activeLoans.length})
          </h2>

          {activeLoans.length > 0 ? (
            <div className="grid gap-4">
              {activeLoans.map((loan) => {
                const book = loan.books as any
                const badge = getStatusBadge(loan.status)
                const isOverdue = loan.due_date && new Date(loan.due_date) < new Date()

                return (
                  <div key={loan.id} className={`bg-white p-4 rounded-2xl shadow border ${isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-100'} flex gap-4 items-center transition-shadow hover:shadow-md`}>

                    {/* Portada pequeña */}
                    <div className="w-16 h-24 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0 shadow-sm">
                      {book?.cover_url ? (
                        <Image src={book.cover_url} alt={book.title} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-robles-green-light text-robles-brown text-2xl">📖</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-robles-brown leading-tight">{book?.title || 'Libro desconocido'}</h3>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${badge.color}`}>
                          {badge.icon} {badge.text}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{book?.author}</p>

                      {/* Fecha de devolución */}
                      {loan.due_date && (
                        <div className={`mt-3 text-sm font-semibold flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-robles-green-dark'}`}>
                          <span>{isOverdue ? '🚨 ¡Atrasado!' : '📅 Devolver antes:'}</span>
                          <span>{new Date(loan.due_date).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                        </div>
                      )}
                        {/* --- NUEVO: ACCIONES SEGÚN ESTADO --- */}
                        {loan.status === 'reserved' && (
                          <div className="mt-3">
                            <CancelReservationButton loanId={loan.id} />
                          </div>
                        )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl text-center border border-dashed border-gray-300">
              <div className="text-5xl mb-3">🦥</div>
              <p className="text-gray-500 font-semibold">No tienes libros prestados actualmente.</p>
              <Link href="/catalog" className="mt-4 inline-block bg-robles-green text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-robles-green-dark transition-colors">
                ¡Buscar un libro!
              </Link>
            </div>
          )}
        </section>

        {/* SECCIÓN 2: Historial */}
        <section>
          <h2 className="text-xl font-bold text-robles-brown mb-4 border-b-2 border-gray-200 pb-2 inline-block opacity-80">
            Historial de Lectura ({historyLoans.length})
          </h2>

          {historyLoans.length > 0 ? (
            <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-100 divide-y">
              {historyLoans.map((loan) => {
                const book = loan.books as any
                return (
                  <div key={loan.id} className="p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-14 bg-gray-100 rounded overflow-hidden relative flex-shrink-0">
                       {book?.cover_url ? (
                         <Image src={book.cover_url} alt="" fill className="object-cover" sizes="40px" />
                       ) : (
                         <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">📄</div>
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 truncate">{book?.title}</h4>
                      <p className="text-xs text-gray-400">
                        Devuelto el: {loan.returned_at ? new Date(loan.returned_at).toLocaleDateString('es-CL') : 'N/A'}
                      </p>
                    </div>
                    <span className="text-green-500 text-xl">✅</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400 text-sm">
              Aún no has devuelto ningún libro.
            </div>
          )}
        </section>

      </div>
    </main>
  )
}