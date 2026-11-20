import { Outlet } from 'react-router'
import { FlashMessages } from '../ui/FlashMessages.tsx'

// Layout del login: una sola tarjeta centrada sobre el fondo, con una franja grafito arriba.
// También muestra flashes: "Sesión cerrada" y "Tu sesión expiró…" aparecen aquí.
export function AuthLayout() {
  return (
    <>
      <FlashMessages />
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm overflow-hidden rounded-panel border border-line bg-surface">
          <div className="bg-primary px-6 py-4 text-lg font-semibold text-white">Cartera</div>
          <div className="px-6 py-6">
            <Outlet />
          </div>
        </div>
      </main>
    </>
  )
}
