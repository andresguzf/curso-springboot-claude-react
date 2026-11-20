import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../../hooks/useAuth.ts'
import { useAuthStore } from '../../stores/authStore.ts'
import { Spinner } from '../ui/Spinner.tsx'

// Ruta de layout que protege todo lo que cuelga de ella.
export function RequireAuth() {
  const { status } = useAuth()
  const loggedOut = useAuthStore((state) => state.loggedOut)
  const location = useLocation()

  // Mientras /me responde no se sabe si hay sesión: ni contenido ni login, solo un indicador.
  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-muted">
        <Spinner label="Comprobando la sesión" className="size-6" />
      </div>
    )
  }

  // Sin sesión: al login, guardando a dónde quería ir para volver después de entrar
  // (salvo que acabe de cerrar sesión: entonces el siguiente login empieza en el inicio).
  if (status === 'anonymous') {
    return <Navigate to="/login" state={loggedOut ? undefined : { from: location }} replace />
  }

  return <Outlet />
}
