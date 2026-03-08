'use client'

import { useState, useEffect } from 'react'

export default function InstallButton() {
  // Estado para guardar el evento de instalación
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Escuchamos el evento 'beforeinstallprompt' que lanza el navegador
    const handler = (e: Event) => {
      e.preventDefault() // Prevenimos que el navegador muestre el suyo automáticamente
      setDeferredPrompt(e) // Guardamos el evento para lanzarlo después
      setIsVisible(true)   // Mostramos nuestro botón
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Mostramos el prompt nativo de instalación
    deferredPrompt.prompt()

    // Esperamos a ver qué decidió el usuario
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('Usuario aceptó instalar la app')
      setIsVisible(false) // Ocultamos el botón porque ya está instalada
    }

    setDeferredPrompt(null) // Limpiamos
  }

  // Si el navegador no ha dicho que es instalable, no mostramos nada
  if (!isVisible) return null

  return (
    <button
      onClick={handleInstall}
      className="w-full bg-transparent border-2 border-white text-white py-3 rounded-2xl font-bold text-lg shadow-lg hover:bg-white hover:text-robles-green transition-all flex items-center justify-center gap-2 mt-4"
    >
      <span>📱</span>
      <span>Instalar Aplicación</span>
    </button>
  )
}