import { NavLink } from 'react-router'

type NavItem = {
  to: string
  label: string
}

// Agrega aquí una entrada por cada página nueva.
const NAV_ITEMS: NavItem[] = [{ to: '/', label: 'Inicio' }]

function linkClassName({ isActive }: { isActive: boolean }) {
  return isActive
    ? 'rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white'
    : 'rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100'
}

export function Navbar() {
  return (
    <nav aria-label="Principal">
      <ul className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end className={linkClassName}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
