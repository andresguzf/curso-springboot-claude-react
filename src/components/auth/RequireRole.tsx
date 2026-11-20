import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../../hooks/useAuth.ts'
import type { Role } from '../../schemas/user.ts'

type RequireRoleProps = {
  role: Role
}

// Ruta de layout para las páginas de un rol (va dentro de RequireAuth, así ya hay usuario).
// Solo evita mostrar pantallas inútiles: quien decide el acceso es el backend (403).
export function RequireRole({ role }: RequireRoleProps) {
  const { user } = useAuth()

  if (user?.role !== role) return <Navigate to="/forbidden" replace />

  return <Outlet />
}
