import { createClient } from '@/lib/supabase/server'
import { saveSettings } from '@/app/actions/admin'
import Link from 'next/link'

export default async function AdminSettingsPage() {
  const supabase = createClient()

  // Obtener valores actuales
  const { data: settings } = await supabase
    .from('app_settings')
    .select('*')

  // Convertir a objeto para fácil acceso
  const config: Record<string, string> = {}
  settings?.forEach(s => { config[s.key] = s.value })

  return (
    <main className="min-h-screen bg-gray-100 pb-12">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-robles-brown font-semibold">
            ← Volver al Panel
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2">⚙️ Configuración del Sistema</h1>
          <p className="text-gray-500">Ajusta los parámetros generales de la biblioteca.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow border">
          <form action={saveSettings} className="space-y-6">

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Duración del Préstamo (Días)
              </label>
              <input
                type="number"
                name="loan_duration_days"
                defaultValue={config['loan_duration_days'] || '7'}
                className="w-full border-2 rounded-xl px-4 py-2 focus:border-robles-green outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Días que el alumno tiene para devolver el libro una vez retirado.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Vigencia de Reserva (Días)
              </label>
              <input
                type="number"
                name="reservation_duration_days"
                defaultValue={config['reservation_duration_days'] || '2'}
                className="w-full border-2 rounded-xl px-4 py-2 focus:border-robles-green outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Si el alumno no retira el libro en este tiempo, la reserva se cancela automáticamente y el libro queda libre.
              </p>
            </div>

            <div className="pt-4 border-t">
              <button
                type="submit"
                className="w-full bg-robles-green text-white py-3 rounded-xl font-bold text-lg hover:bg-robles-green-dark transition-colors shadow"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}