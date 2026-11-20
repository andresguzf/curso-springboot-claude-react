import { Link } from 'react-router'
import { useAuth } from '../../hooks/useAuth.ts'
import { Navbar } from './Navbar.tsx'
import { UserMenu } from './UserMenu.tsx'

// Banda grafito: marca, navegación según el rol y, a la derecha, el usuario en sesión.
export function Header() {
  const { user } = useAuth()

  return (
    <header className="bg-primary text-white">
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-x-8 gap-y-0 px-4">
        <Link to="/" className="py-3 text-lg font-semibold">
          Cartera
        </Link>
        <Navbar role={user?.role} />
        <UserMenu />
      </div>
    </header>
  )
}
