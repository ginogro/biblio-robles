'use client'

import { reserveBook } from '@/app/actions/loans'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface ReserveButtonProps {
  bookId: string
  available: boolean
}

export default function ReserveButton({ bookId, available }: ReserveButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleReserve = async () => {
    setLoading(true)

    const result = await reserveBook(bookId)

    setLoading(false)

    if (!result.success) {
      toast.error("Oh no... 😢", { description: result.message })
    } else {
      toast.success("¡Listo! 🎉", {
        description: result.message,
        action: {
          label: "Ver mis libros",
          onClick: () => router.push('/my-loans')
        }
      })
      // Refrescamos la página para actualizar el estado en tiempo real
      router.refresh()
    }
  }

  if (!available) {
    return (
      <button disabled className="w-full bg-gray-300 text-gray-500 py-4 rounded-2xl font-bold text-lg cursor-not-allowed flex items-center justify-center gap-2">
        <span>Ocupado actualmente 🚫</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleReserve}
      disabled={loading}
      className="w-full bg-robles-green text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-robles-green-dark transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
    >
      {loading ? (
        <span>Reservando...</span>
      ) : (
        <>
          <span>¡Reservar Libro!</span>
          <span className="text-xl">📚</span>
        </>
      )}
    </button>
  )
}