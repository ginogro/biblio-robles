'use client'

import { markAsBorrowed } from '@/app/actions/loans'
import { returnBook } from '@/app/actions/loans'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface LoanActionButtonProps {
  loanId: string
  status: string
}

export default function LoanActionButton({ loanId, status }: LoanActionButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleBorrowed = async () => {
    setLoading(true)
    const result = await markAsBorrowed(loanId)
    setLoading(false)
    if (result.success) {
      toast.success("¡Listo!", { description: result.message })
      router.refresh()
    } else {
      toast.error("Error", { description: result.message })
    }
  }

  const handleReturn = async () => {
    setLoading(true)
    const result = await returnBook(loanId)
    setLoading(false)
    if (result.success) {
      if (result.leveled_up) {
        toast.success("🎉 ¡Felicidades! Nivel subido!", { description: result.message })
      } else {
        toast.success("Devolución exitosa", { description: `Ganaste ${result.points_earned} puntos.` })
      }
      router.refresh()
    } else {
      toast.error("Error", { description: result.message })
    }
  }

  if (status === 'reserved') {
    return (
      <button
        onClick={handleBorrowed}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? '...' : 'Marcar Retirado'}
      </button>
    )
  }

  return (
    <button
      onClick={handleReturn}
      disabled={loading}
      className="bg-robles-green text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-700 disabled:opacity-50"
    >
      {loading ? '...' : 'Marcar Devuelto'}
    </button>
  )
}