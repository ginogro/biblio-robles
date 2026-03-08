import Navbar from '@/components/shared/navbar'
import { Toaster } from 'sonner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      {children}
      {/* Footer simple */}
      <footer className="bg-white border-t p-6 text-center text-gray-500 text-sm mt-auto">
        © {new Date().getFullYear()} LeoRobles - Colegio Seguro
      </footer>

      {/* Componente global para mostrar toasts */}
      <Toaster richColors position="top-center" />
    </>
  )
}