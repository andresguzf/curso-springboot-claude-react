import { LogOut } from 'lucide-react'
import { useAuth, useLogout } from '../../hooks/useAuth.ts'
import { ROLE_LABELS } from '../../schemas/user.ts'
import { Badge } from '../ui/Badge.tsx'
import { IconButton } from '../ui/IconButton.tsx'

// Zona del usuario en el header: quién está en sesión, con qué rol, y la salida.
// Va en línea (sin desplegable): son tres elementos y así no hace falta manejar foco ni clics fuera.
// Cerrar sesión es un botón de icono (como el del tema): el nombre accesible y la ayuda dicen la acción.
export function UserMenu() {
  const { user } = useAuth()
  const logout = useLogout()

  if (!user) return null

  return (
    <div className="flex min-w-0 items-center gap-3 py-2">
      <span className="truncate text-sm text-white/90">{user.email}</span>
      <Badge tone={user.role === 'ADMIN' ? 'accent' : 'neutral'}>{ROLE_LABELS[user.role]}</Badge>
      <IconButton
        label={logout.isPending ? 'Cerrando sesión…' : 'Cerrar sesión'}
        icon={LogOut}
        tone="band"
        isPending={logout.isPending}
        onClick={() => logout.mutate()}
      />
    </div>
  )
}
