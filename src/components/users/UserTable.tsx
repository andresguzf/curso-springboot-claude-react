import type { ReactNode } from 'react'
import { Pencil } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { formatDay } from '../../lib/format.ts'
import type { UserAction } from '../../hooks/useUserActions.ts'
import type { User } from '../../schemas/user.ts'
import { Badge } from '../ui/Badge.tsx'
import { DataTable, type DataTableColumn } from '../ui/DataTable.tsx'
import { IconLink } from '../ui/IconButton.tsx'
import { RoleBadge } from './RoleBadge.tsx'
import { UserActions } from './UserActions.tsx'

type UserTableProps = {
  users: User[]
  /** Usuario en sesión: su fila se marca con «Tú» y no puede quitarse permisos. */
  me: User | null
  /** Administradores habilitados (regla del último admin). */
  activeAdmins?: number
  onAction: (action: UserAction, user: User) => void
  /** Usuario con una acción en curso: sus botones quedan bloqueados. */
  busyUserId?: number
  sort: string
  onSortChange: (sort: string) => void
  isDimmed?: boolean
  empty?: ReactNode
}

// Tabla de usuarios. El email enlaza a la ficha y lleva el query string actual en el state,
// para volver con los mismos filtros. Cada fila tiene editar y las acciones rápidas.
export function UserTable({ users, me, activeAdmins, onAction, busyUserId, sort, onSortChange, isDimmed, empty }: UserTableProps) {
  const location = useLocation()
  const listState = { listSearch: location.search }

  const columns: DataTableColumn<User>[] = [
    {
      key: 'email',
      header: 'Email',
      sortField: 'email',
      cell: (user) => (
        <span className="inline-flex items-center gap-2">
          <Link
            to={`/users/${user.id}`}
            state={listState}
            title={user.email}
            className="max-w-32 truncate font-medium text-ink underline-offset-2 hover:underline @md:max-w-48"
          >
            {user.email}
          </Link>
          {user.id === me?.id && <span className="text-[0.8125rem] text-ink-muted">Tú</span>}
        </span>
      ),
    },
    // Email y acciones siempre; estado, rol y alta según el ancho del contenedor de la tabla.
    { key: 'role', header: 'Rol', sortField: 'role', minWidth: 'lg', cell: (user) => <RoleBadge role={user.role} /> },
    {
      key: 'enabled',
      header: 'Estado',
      sortField: 'enabled',
      minWidth: 'md',
      cell: (user) => (user.enabled ? <Badge tone="success">Habilitado</Badge> : <Badge>Deshabilitado</Badge>),
    },
    {
      key: 'createdAt',
      header: 'Alta',
      sortField: 'createdAt',
      minWidth: '3xl',
      cell: (user) => formatDay(user.createdAt),
      className: 'tabular-nums',
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'text-right',
      cell: (user) => (
        <UserActions
          user={user}
          me={me}
          activeAdmins={activeAdmins}
          onAction={onAction}
          busy={busyUserId === user.id}
          leading={<IconLink to={`/users/${user.id}/edit`} state={listState} label={`Editar a ${user.email}`} icon={Pencil} />}
        />
      ),
    },
  ]

  return (
    <DataTable
      caption="Usuarios"
      columns={columns}
      rows={users}
      getRowId={(user) => user.id}
      sort={sort}
      onSortChange={onSortChange}
      isDimmed={isDimmed}
      empty={empty}
    />
  )
}
