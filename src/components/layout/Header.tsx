import { Link } from 'react-router'
import { Navbar } from './Navbar.tsx'

// Banda grafito: marca, navegación principal y (spec 03) la zona del usuario a la derecha.
export function Header() {
  return (
    <header className="bg-primary text-white">
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-x-8 gap-y-0 px-4">
        <Link to="/" className="py-3 text-lg font-semibold">
          Cartera
        </Link>
        <Navbar />
      </div>
    </header>
  )
}
