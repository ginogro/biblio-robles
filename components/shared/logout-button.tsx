'use client'

import { logout } from '@/app/actions/auth'

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="w-full text-left text-red-600 hover:text-red-800 font-semibold flex items-center gap-2 transition-colors"
      >
        <span>🚪</span>
        <span>Cerrar Sesión</span>
      </button>
    </form>
  )
}