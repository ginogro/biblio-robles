'use client'

import { useState } from 'react'
import { addStudent } from '@/app/actions/admin'
import { toast } from 'sonner'
import Link from 'next/link'

export default function NewStudentPage() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await addStudent(formData)
    setLoading(false)

    if (result.success) {
      toast.success("¡Éxito!", { description: result.message })
      // Redirigir a la lista
      window.location.href = '/admin/students'
    } else {
      toast.error("Error", { description: result.message })
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-8 border border-gray-100">
      <div className="mb-6">
        <Link href="/admin/students" className="text-sm text-gray-500 hover:text-robles-brown font-semibold">
          &larr; Volver a la lista
        </Link>
        <h1 className="text-2xl font-bold text-robles-brown mt-2 flex items-center gap-2">
          <span>👤</span> Inscribir Nuevo Alumno
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
          <input
            name="full_name"
            type="text"
            required
            placeholder="Ej: María Pérez"
            className="w-full border-2 rounded-xl px-4 py-2 focus:border-robles-green outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">ID Escolar</label>
            <input
              name="school_id"
              type="text"
              required
              placeholder="Ej: EST-005"
              className="w-full border-2 rounded-xl px-4 py-2 focus:border-robles-green outline-none uppercase"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Curso</label>
            <input
              name="grade"
              type="text"
              required
              placeholder="Ej: 1ro Básico A"
              className="w-full border-2 rounded-xl px-4 py-2 focus:border-robles-green outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña Inicial</label>
          <input
            name="password"
            type="text" // Lo dejamos texto para que el admin pueda verla y anotarla
            required
            placeholder="Ej: 123456"
            className="w-full border-2 rounded-xl px-4 py-2 focus:border-robles-green outline-none bg-gray-50"
          />
          <p className="text-xs text-gray-400 mt-1">El alumno podrá cambiarla después.</p>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-robles-green text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-robles-green-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Crear Alumno'}
          </button>
        </div>
      </form>
    </div>
  )
}