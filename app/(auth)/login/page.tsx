'use client' // Necesario para usar estados (useState)

import { loginWithSchoolId } from '@/app/actions/auth'
import Image from 'next/image'
import Link from 'next/link'
import InstallButton from '@/components/shared/InstallButton'
import SubmitButton from '@/components/ui/submit-button'


export default function LoginPage() {

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-robles-green-light to-white p-4 relative">

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
        <form action={loginWithSchoolId} className="space-y-4">
          <div>
            <label htmlFor="school_id" className="block text-sm font-bold text-robles-brown mb-2 tracking-wide">
              Tu Código Secreto (ID)
            </label>
            <input
              id="school_id"
              name="school_id"
              type="text"
              required
              placeholder="Ej: est-001"
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

            />
          </div>

          <SubmitButton />

          <div className="mt-4">
            <InstallButton />
          </div>
        </form>
      </div>
    </div>
  )
}