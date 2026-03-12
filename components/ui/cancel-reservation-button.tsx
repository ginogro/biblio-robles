'use client'

import { cancelReservation } from '@/app/actions/loans'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function CancelReservationButton({ loanId }: { loanId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    if (!confirm('¿Seguro que quieres quitar tu reserva? El libro quedará libre para otros.')) return

    setLoading(true)
    const result = await cancelReservation(loanId)
    setLoading(false)

    if (result.success) {
      toast.success("Reserva cancelada", { description: "El libro está disponible nuevamente." })
      router.refresh()
    } else {
      toast.error("Error", { description: result.message })
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="text-red-600 hover:text-red-800 text-sm font-semibold disabled:opacity-50 flex items-center gap-1"
    >
      {loading ? (
        <span>Cancelando...</span>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Quitar Reserva</span>
        </>
      )}
    </button>
  )
}