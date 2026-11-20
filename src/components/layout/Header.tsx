import { Link } from 'react-router'
import { useAuth } from '../../hooks/useAuth.ts'
import { ROLE_LABELS } from '../../schemas/user.ts'
import { Badge } from '../ui/Badge.tsx'
import { Navbar } from './Navbar.tsx'

// Banda grafito: marca, navegación principal y, a la derecha, el usuario en sesión
// (en C-03 pasa a ser el menú de usuario con "Cerrar sesión").
export function Header() {
  const { user } = useAuth()

  return (
    <header className="bg-primary text-white">
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-x-8 gap-y-0 px-4">
        <Link to="/" className="py-3 text-lg font-semibold">
          Cartera
        </Link>
        <Navbar />
        {user && (
          <div className="ml-auto flex min-w-0 items-center gap-3 py-3">
            <span className="truncate text-sm text-white/90">{user.email}</span>
            <Badge tone={user.role === 'ADMIN' ? 'accent' : 'neutral'}>{ROLE_LABELS[user.role]}</Badge>
          </div>
        )}
      </div>
    </header>
  )
}
