import { Link } from 'react-router'
import { Navbar } from './Navbar.tsx'

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="text-lg font-semibold text-slate-900">
          __APP_NAME__
        </Link>
        <Navbar />
      </div>
    </header>
  )
}
