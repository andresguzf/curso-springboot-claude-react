import type { ReactNode } from 'react'
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

// Tabla de usuarios. La ficha y las acciones por fila llegan en E-03 y E-04.
export function UserTable({ users, currentUserId, sort, onSortChange, isDimmed, empty }: UserTableProps) {
  const columns: DataTableColumn<User>[] = [
    {
      key: 'email',
      header: 'Email',
      sortField: 'email',
      cell: (user) => (
        <span className="inline-flex items-center gap-2">
          <span className="font-medium">{user.email}</span>
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
