import { Outlet } from 'react-router'
import { FlashMessages } from '../ui/FlashMessages.tsx'
import { NavigationProgress } from './NavigationProgress.tsx'
import { ThemeToggle } from './ThemeToggle.tsx'

// Layout del login: una sola tarjeta centrada sobre el fondo, con una franja grafito arriba.
// También muestra flashes: "Sesión cerrada" y "Tu sesión expiró…" aparecen aquí.
export function AuthLayout() {
  return (
    <>
      <NavigationProgress />
      <FlashMessages />
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm overflow-hidden rounded-panel border border-line bg-surface">
          <div className="flex items-center justify-between bg-band py-3 pr-3 pl-6 text-lg font-semibold text-white">
            Cartera
            <ThemeToggle />
          </div>
          <div className="px-6 py-6">
            <Outlet />
          </div>
        </div>
      </main>
    </>
  )
}
