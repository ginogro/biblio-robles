// app/(dashboard)/admin/settings/SettingsForm.tsx
'use client'

import { useFormState } from 'react-dom'
import { saveSettings } from '@/app/actions/admin'

type SettingsState = { success: boolean; message: string } | null

interface SettingsFormProps {
  initialConfig: Record<string, string>
}

export default function SettingsForm({ initialConfig }: SettingsFormProps) {
  // ✅ Los genéricos son: <EstadoRetornado, ArgumentosDeEntrada>
  const [state, formAction, isPending] = useFormState<SettingsState, FormData>(
    saveSettings,
    null
  )
  return (
    <div className="bg-white p-6 rounded-2xl shadow border">
      {/* formAction ya está vinculado correctamente por el hook */}
      <form action={formAction} className="space-y-6">

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Duración del Préstamo (Días)
          </label>
          <input
            type="number"
            name="loan_duration_days"
            defaultValue={initialConfig['loan_duration_days'] || '7'}
            className="w-full border-2 rounded-xl px-4 py-2 focus:border-robles-green outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Días que el alumno tiene para devolver el libro una vez retirado.
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Vigencia de Reserva (Días)
          </label>
          <input
            type="number"
            name="reservation_duration_days"
            defaultValue={initialConfig['reservation_duration_days'] || '2'}
            className="w-full border-2 rounded-xl px-4 py-2 focus:border-robles-green outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Si el alumno no retira el libro en este tiempo, la reserva se cancela automáticamente.
          </p>
        </div>

        {/* Mensaje de resultado reactivo */}
        {state?.message && (
          <div
            className={`p-4 rounded-lg ${
              state.success
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {state.message}
          </div>
        )}

        <div className="pt-4 border-t">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-robles-green text-white py-3 rounded-xl font-bold text-lg hover:bg-robles-green-dark transition-colors shadow disabled:opacity-50"
          >
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}