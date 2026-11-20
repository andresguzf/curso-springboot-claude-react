import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { formatDateTime } from '../../lib/format.ts'
import type { User } from '../../schemas/user.ts'
import { Badge } from '../ui/Badge.tsx'
import { DataTable, type DataTableColumn } from '../ui/DataTable.tsx'
import { RoleBadge } from './RoleBadge.tsx'

type UserTableProps = {
  users: User[]
  /** Id del usuario en sesión: su fila se marca con «Tú». */
  currentUserId?: number
  sort: string
  onSortChange: (sort: string) => void
  isDimmed?: boolean
  empty?: ReactNode
}

// Tabla de usuarios. El email enlaza a la ficha y lleva el query string actual en el state,
// para volver con los mismos filtros. Las acciones rápidas por fila llegan en E-04.
export function UserTable({ users, currentUserId, sort, onSortChange, isDimmed, empty }: UserTableProps) {
  const location = useLocation()
  const listState = { listSearch: location.search }

  const columns: DataTableColumn<User>[] = [
    {
      key: 'email',
      header: 'Email',
      sortField: 'email',
      cell: (user) => (
        <span className="inline-flex items-center gap-2">
          <Link to={`/users/${user.id}`} state={listState} className="font-medium text-ink underline-offset-2 hover:underline">
            {user.email}
          </Link>
          {user.id === currentUserId && <span className="text-[0.8125rem] text-ink-muted">Tú</span>}
        </span>
      ),
    },
    { key: 'role', header: 'Rol', sortField: 'role', cell: (user) => <RoleBadge role={user.role} /> },
    {
      key: 'enabled',
      header: 'Estado',
      sortField: 'enabled',
      cell: (user) => (user.enabled ? <Badge tone="success">Habilitado</Badge> : <Badge>Deshabilitado</Badge>),
    },
    {
      key: 'createdAt',
      header: 'Alta',
      sortField: 'createdAt',
      cell: (user) => formatDateTime(user.createdAt),
      className: 'tabular-nums',
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'text-right',
      cell: (user) => (
        <Link
          to={`/users/${user.id}/edit`}
          state={listState}
          aria-label={`Editar a ${user.email}`}
          className="text-sm font-medium text-accent-strong underline-offset-2 hover:underline"
        >
          Editar
        </Link>
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
