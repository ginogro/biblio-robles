'use client'

import { markAsBorrowed } from '@/app/actions/loans'
import { returnBook } from '@/app/actions/loans'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface LoanActionButtonProps {
  loanId: string
  status: string // 'reserved' o 'borrowed'
}

export default function LoanActionButton({ loanId, status }: LoanActionButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAction = async (action: 'borrow' | 'return') => {
    setLoading(true)
    let result;

    if (action === 'borrow') {
      result = await markAsBorrowed(loanId)
    } else {
      result = await returnBook(loanId)
    }

    setLoading(false)

    if (result.success) {
      toast.success("Éxito", { description: result.message })
      router.refresh()
    } else {
      toast.error("Error", { description: result.message })
    }
  }

  if (status === 'reserved') {
    return (
      <button
        onClick={() => handleAction('borrow')}
        disabled={loading}
        className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-yellow-600 transition-colors disabled:opacity-50 shadow"
      >
        {loading ? '...' : '✅ Marcar como Retirado'}
      </button>
    )
  }

  if (status === 'borrowed') {
    return (
      <button
        onClick={() => handleAction('return')}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-blue-700 transition-colors disabled:opacity-50 shadow"
      >
        {loading ? '...' : '📚 Marcar como Devuelto'}
      </button>
    )
  }

  return null
}