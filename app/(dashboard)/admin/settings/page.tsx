// app/(dashboard)/admin/settings/page.tsx
import { createClient } from '@/lib/supabase/server'
import SettingsForm from './SettingsForm' // Importar el componente cliente
import Link from 'next/link'

export default async function AdminSettingsPage() {
  const supabase = createClient()

  // Obtener valores actuales (Solo en servidor)
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

        {/* Pasar los datos como props al componente cliente */}
        <SettingsForm initialConfig={config} />

      </div>
    </main>
  )
}