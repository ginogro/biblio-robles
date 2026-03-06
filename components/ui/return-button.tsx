'use client' // Esto es un Client Component

import { returnBook } from '@/app/actions/loans' // Importamos la Server Action
import { toast } from 'sonner' // Importamos la función de notificación
import { useState } from 'react'

interface ReturnButtonProps {
  loanId: string
}

export default function ReturnButton({ loanId }: ReturnButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleReturn = async () => {
    setLoading(true)

    // 1. Llamamos a la Server Action (Backend)
    const result = await returnBook(loanId)

    setLoading(false)

    // 2. Procesamos la respuesta
    if (!result.success) {
      toast.error("Error", { description: result.message })
      return
    }

    // 3. Si todo ok, mostramos la notificación
    if (result.leveled_up) {
      // CASO ESPECIAL: Subió de nivel
      toast.success("🎉 ¡FELICIDADES! ¡Subiste de nivel!", {
        description: `Ahora eres un lector más avanzado. ¡Sigue así!`,
        duration: 6000, // Dura más tiempo para que lo lean
        action: {
          label: "Ver Nivel",
          onClick: () => window.location.href = '/profile', // Redirige al perfil
        },
      })
    } else {
      // CASO NORMAL: Devolución estándar
      toast.success("Devolución exitosa", {
        description: `Has ganado ${result.points_earned} puntos.`,
      })
    }

    // Opcional: Recargar la página para actualizar la lista de libros
    // window.location.reload()
  }

  return (
    <button
      onClick={handleReturn}
      disabled={loading}
      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
    >
      {loading ? 'Procesando...' : 'Marcar como Devuelto'}
    </button>
  )
}