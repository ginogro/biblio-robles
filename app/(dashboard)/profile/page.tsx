import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProgressBar from '@/components/ui/progress-bar'
import BadgeCard from '@/components/ui/badge-card'
import BookCard from '@/components/ui/book-card'
import Image from 'next/image'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
console.log('ahi vo .   y')
  // Si no hay usuario, al login
  if (!user) redirect('/login')
console.log('ahi voy')
  // 1. Datos del Estudiante
  const { data: student, error } = await supabase
    .from('students')
    .select(`
      full_name,
      grade,
      current_points,
      current_loan_limit,
      current_level_id,
      gamification_levels ( id, name, min_points )
    `)
    .eq('id', user.id)
    .single()

  // MANEJO DE ERROR: Si no es estudiante (ej: es admin) o hay error
  if (error || !student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-robles-green-light/30 text-center p-4">
        <div className="text-6xl mb-4">🤖</div>
        <h1 className="text-2xl font-bold text-robles-brown mb-2">¡Hola, Bibliotecario!</h1>
        <p className="text-gray-600 mb-6">Este espacio es solo para alumnos. Tú tienes el control total.</p>
        <Link href="/" className="bg-robles-green text-white px-6 py-3 rounded-xl font-bold hover:bg-robles-green-dark">
          Volver al Inicio
        </Link>
      </div>
    )
  }

  // 2. Préstamos Activos
  const { data: activeLoans } = await supabase
    .from('loans')
    .select(`id, due_date, books ( id, title, cover_url )`)
    .eq('student_id', user.id)
    .in('status', ['borrowed', 'reserved'])
    .order('due_date', { ascending: true })

  // 3. Historial
  const { data: history } = await supabase
    .from('loans')
    .select(`books ( genre )`)
    .eq('student_id', user.id)
    .eq('status', 'returned')
    .limit(1)

  const lastGenre = history && history.length > 0 ? (history[0].books as any)?.genre : null;
  const booksReadCount = history?.length || 0;

  // 4. Insignias
  const { data: studentBadges } = await supabase
    .from('student_badges')
    .select('badges ( id, name, description, icon_url )')
    .eq('student_id', user.id)

  const unlockedBadgeIds = studentBadges?.map((sb: any) => sb.badges.id) || []
  const { data: allBadges } = await supabase.from('badges').select('*')

  // 5. Recomendaciones
  let recommendations = [];
  if (lastGenre) {
    const { data } = await supabase
      .from('books')
      .select('id, title, cover_url, available_copies')
      .eq('genre', lastGenre)
      .limit(4);
    recommendations = data || [];
  }
  if (recommendations.length === 0) {
    const { data } = await supabase
      .from('books')
      .select('id, title, cover_url, available_copies')
      .limit(4);
    recommendations = data || [];
  }

  // Cálculo de Niveles
  const currentLevelData = student.gamification_levels as any
  const { data: allLevels } = await supabase
    .from('gamification_levels')
    .select('*')
    .order('min_points', { ascending: true })

  const currentIndex = allLevels?.findIndex(l => l.id === currentLevelData?.id) ?? -1
  const nextLevel = allLevels && currentIndex >= 0 && currentIndex < allLevels.length - 1
    ? allLevels[currentIndex + 1]
    : null

  return (
    <main className="min-h-screen bg-robles-green-light/30 pb-12">

      {/* CABECERA DE PERFIL */}
      <div className="bg-gradient-to-b from-robles-green to-robles-green-dark text-white pt-8 pb-20 px-4 rounded-b-[3rem] relative overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-robles-green text-4xl font-bold border-4 border-white shadow-lg mb-4">
            {student.full_name.charAt(0)}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">{student.full_name}</h1>
          <p className="text-white/80 font-semibold">{student.grade}</p>
        </div>
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-3/4 h-20 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* TARJETA DE ESTADÍSTICAS */}
      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-20 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-xl grid grid-cols-3 divide-x divide-gray-100 text-center border border-gray-50">
          <div>
            <p className="text-3xl font-extrabold text-robles-green">{student.current_points}</p>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1">Puntos</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-robles-brown">{booksReadCount}</p>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1">Leídos</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-robles-accent">{student.current_loan_limit}</p>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1">Cupo</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-8">

        {/* NIVEL */}
        <section className="bg-white p-6 rounded-2xl shadow border border-gray-100">
          <h2 className="text-lg font-bold text-robles-brown mb-4 flex items-center gap-2">
            <span>⚡</span> Tu Nivel de Lectura
          </h2>
          <ProgressBar
            currentPoints={student.current_points}
            currentLevelMinPoints={currentLevelData?.min_points || 0}
            nextLevelMinPoints={nextLevel?.min_points || null}
            levelName={currentLevelData?.name || 'Sin Nivel'}
          />
        </section>

        {/* PRÉSTAMOS ACTIVOS */}
        {activeLoans && activeLoans.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-robles-brown mb-4 flex items-center gap-2">
              <span>📚</span> Libros que tienes ahora
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeLoans.map((loan: any) => (
                <div key={loan.id} className="bg-white p-4 rounded-2xl shadow flex gap-4 items-center border border-gray-100">
                  <div className="w-16 h-24 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
                    {loan.books.cover_url ? (
                      <Image
                        src={loan.books.cover_url}
                        alt=""
                        fill
                        className="object-cover"
                        // CORRECCIÓN: priority no suele necesitar aquí si es pequeño, pero size sí es bueno.
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-robles-green-light"><span className="text-2xl">📖</span></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-robles-brown">{loan.books.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Devolver antes: <span className="font-bold text-robles-green">
                        {new Date(loan.due_date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* INSIGNIAS */}
        <section>
          <h2 className="text-lg font-bold text-robles-brown mb-4 flex items-center gap-2">
            <span>🏅</span> Mis Logros
          </h2>
          {allBadges && allBadges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {allBadges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  name={badge.name}
                  description={badge.description}
                  iconUrl={badge.icon_url}
                  unlocked={unlockedBadgeIds.includes(badge.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg border">
              Aún no hay insignias en el sistema.
            </div>
          )}
        </section>

        {/* RECOMENDACIONES */}
        {recommendations.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-robles-brown mb-4 flex items-center gap-2">
              <span>🌟</span> Sugerido para ti
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendations.map((book, index) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  coverUrl={book.cover_url}
                  status={book.available_copies > 0 ? 'available' : 'borrowed'}
                />
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  )
}