import { useAuth, useLogout } from '../../hooks/useAuth.ts'
import { ROLE_LABELS } from '../../schemas/user.ts'
import { Badge } from '../ui/Badge.tsx'

// Zona del usuario en el header: quién está en sesión, con qué rol, y la salida.
// Va en línea (sin desplegable): son tres elementos y así no hace falta manejar foco ni clics fuera.
export function UserMenu() {
  const { user } = useAuth()
  const logout = useLogout()

  if (!user) return null

  return (
    <div className="ml-auto flex min-w-0 items-center gap-3 py-2">
      <span className="truncate text-sm text-white/90">{user.email}</span>
      <Badge tone={user.role === 'ADMIN' ? 'accent' : 'neutral'}>{ROLE_LABELS[user.role]}</Badge>
      <button
        type="button"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="rounded-control px-2.5 py-1.5 text-sm font-medium whitespace-nowrap text-white/90 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-60"
      >
        {logout.isPending ? 'Cerrando sesión…' : 'Cerrar sesión'}
      </button>
    </div>
  )
}
