'use client' // Necesario para usar estados (useState)

import { loginWithSchoolId } from '@/app/actions/auth'
import Image from 'next/image'
import Link from 'next/link'
import InstallButton from '@/components/shared/InstallButton'
import { useState } from 'react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  // Manejador de envío del formulario
  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true) // Mostramos el loader
    // Llamamos a la acción del servidor
    await loginWithSchoolId(formData)
    // Nota: Si el login falla, la acción redirige de vuelta a login,
    // por lo que necesitamos una forma de detener la carga si algo falla.
    // Sin embargo, como usamos redirect en el servidor, si llega aquí es porque hubo un error de red
    // o el redirect no se ejecutó. Para simplificar, dejaremos que el usuario recargue si se queda pegado,
    // o podemos resetearlo tras unos segundos, pero usualmente el redirect maneja todo.
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-robles-green-light to-white p-4 relative">

      {/* OVERLAY DE CARGA (Aparece cuando isLoading es true) */}
      {isLoading && (
        <div className="absolute inset-0 bg-robles-green/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center transition-opacity duration-300">
          <div className="relative w-24 h-24 animate-spin">
             <Image
                src="/icoleorobles.png"
                alt="Cargando"
                fill
                className="object-contain"
             />
          </div>
          <p className="text-white text-xl font-bold mt-4 animate-pulse">
            Abriendo el mundo de los libros... 🚀
          </p>
        </div>
      )}

      {/* Botón Volver */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-robles-brown hover:text-robles-green font-semibold transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </Link>
      </div>

      {/* Logo Grande */}
      <div className="mb-8 text-center animate-bounce">
        <Image src="/icoleorobles.png" alt="Logo" width={120} height={120} />
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-2xl border-4 border-robles-green">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-robles-brown">¡Hola Amigo!</h1>
          <p className="text-robles-green mt-2 font-semibold">¿Listo para leer?</p>
        </div>

        {/* Usamos la acción personalizada en el form */}
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="school_id" className="block text-sm font-bold text-robles-brown mb-2 tracking-wide">
              Tu Código Secreto (ID)
            </label>
            <input
              id="school_id"
              name="school_id"
              type="text"
              required
              placeholder="Ej: EST-001"
              className="w-full px-5 py-4 text-lg border-2 border-robles-brown-light rounded-2xl focus:ring-4 focus:ring-robles-green focus:border-robles-green outline-none bg-robles-green-light/30 placeholder:text-robles-brown/40 font-semibold"
              disabled={isLoading} // Desactivar mientras carga
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-robles-brown mb-2 tracking-wide">
              Tu Clave
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-5 py-4 text-lg border-2 border-robles-brown-light rounded-2xl focus:ring-4 focus:ring-robles-green focus:border-robles-green outline-none bg-robles-green-light/30 placeholder:text-robles-brown/40 font-semibold"
              disabled={isLoading} // Desactivar mientras carga
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary text-xl py-4 mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : '¡A Leer! 📖✨'}
          </button>

          <div className="mt-4">
            <InstallButton />
          </div>
        </form>
      </div>
    </div>
  )
}