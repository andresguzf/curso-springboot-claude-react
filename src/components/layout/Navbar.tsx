import { NavLink } from 'react-router'
import type { Role } from '../../schemas/user.ts'

type NavItem = {
  to: string
  label: string
  /** Roles que ven el enlace; sin `roles`, lo ven todos. */
  roles?: Role[]
}

// Una entrada por cada página del menú; `roles` la oculta a los demás (la ruta además está protegida).
const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Resumen' },
  { to: '/customers', label: 'Clientes' },
  { to: '/users', label: 'Usuarios', roles: ['ADMIN'] },
]

function linkClassName({ isActive }: { isActive: boolean }) {
  const base = 'block border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap transition-colors'
  return isActive
    ? `${base} border-accent text-white`
    : `${base} border-transparent text-white/80 hover:text-white`
}

type NavbarProps = {
  /** Rol del usuario en sesión: los enlaces con `roles` solo se muestran a esos roles. */
  role?: Role
}

export function Navbar({ role }: NavbarProps) {
  const items = NAV_ITEMS.filter((item) => !item.roles || (role !== undefined && item.roles.includes(role)))

  return (
    <nav aria-label="Principal" className="-mb-px overflow-x-auto">
      <ul className="flex items-center gap-5">
        {items.map((item) => (
          <li key={item.to}>
            {/* `end` solo en el inicio: "Clientes" sigue marcado en /customers/5. */}
            <NavLink to={item.to} end={item.to === '/'} className={linkClassName}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
