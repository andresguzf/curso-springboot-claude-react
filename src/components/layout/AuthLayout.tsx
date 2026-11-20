import { Outlet } from 'react-router'

// Layout del login: una sola tarjeta centrada sobre el fondo, con una franja grafito arriba.
export function AuthLayout() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm overflow-hidden rounded-panel border border-line bg-surface">
        <div className="bg-primary px-6 py-4 text-lg font-semibold text-white">Cartera</div>
        <div className="px-6 py-6">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
