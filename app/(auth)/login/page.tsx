import { loginWithSchoolId } from '@/app/actions/auth'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-robles-green-light to-white p-4">

      {/* Logo Grande */}
      <div className="mb-8 text-center animate-bounce">
        <Image src="/logo.png" alt="Logo" width={120} height={120} />
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-2xl border-4 border-robles-green">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-robles-brown">¡Hola Amigo!</h1>
          <p className="text-robles-green mt-2 font-semibold">¿Listo para leer?</p>
        </div>

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
              placeholder="Ej: EST-001"
              className="w-full px-5 py-4 text-lg border-2 border-robles-brown-light rounded-2xl focus:ring-4 focus:ring-robles-green focus:border-robles-green outline-none bg-robles-green-light/30 placeholder:text-robles-brown/40 font-semibold"
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

          <button type="submit" className="w-full btn-primary text-xl py-4 mt-4">
            ¡A Leer! 📖✨
          </button>
        </form>
      </div>
    </div>
  )
}