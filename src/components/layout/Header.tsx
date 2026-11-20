import { Link } from 'react-router'
import { Navbar } from './Navbar.tsx'

export function Header() {
  return (
    <header className="bg-primary text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-lg font-semibold">
          Cartera
        </Link>
        <Navbar />
      </div>
    </header>
  )
}
