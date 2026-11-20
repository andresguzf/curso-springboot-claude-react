import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { formatDate, formatDateTime } from '../../lib/format.ts'
import type { Customer } from '../../schemas/customer.ts'
import { Badge } from '../ui/Badge.tsx'
import { DataTable, type DataTableColumn } from '../ui/DataTable.tsx'

type CustomerTableProps = {
  customers: Customer[]
  sort: string
  onSortChange: (sort: string) => void
  isDimmed?: boolean
  empty?: ReactNode
  /** ADMIN: muestra las acciones de escritura por fila. */
  canEdit?: boolean
}

// Tabla de clientes. El nombre enlaza al detalle y lleva el query string actual en el state,
// para que "Volver a clientes" regrese con los mismos filtros y en la misma página.
export function CustomerTable({ customers, sort, onSortChange, isDimmed, empty, canEdit = false }: CustomerTableProps) {
  const location = useLocation()
  const listState = { listSearch: location.search }

  const columns: DataTableColumn<Customer>[] = [
    {
      key: 'name',
      header: 'Nombre',
      sortField: 'lastName',
      cell: (customer) => (
        <Link
          to={`/customers/${customer.id}`}
          state={listState}
          className="font-medium text-ink underline-offset-2 hover:underline"
        >
          {customer.name} {customer.lastName}
        </Link>
      ),
    },
    { key: 'email', header: 'Email', sortField: 'email', cell: (customer) => customer.email },
    { key: 'phone', header: 'Teléfono', cell: (customer) => customer.phone, className: 'tabular-nums' },
    { key: 'city', header: 'Ciudad', sortField: 'city', cell: (customer) => customer.city },
    {
      key: 'birthDate',
      header: 'Nacimiento',
      sortField: 'birthDate',
      cell: (customer) => formatDate(customer.birthDate),
      className: 'tabular-nums',
    },
    {
      key: 'active',
      header: 'Estado',
      sortField: 'active',
      cell: (customer) => (customer.active ? <Badge tone="success">Activo</Badge> : <Badge>Inactivo</Badge>),
    },
    {
      key: 'createdAt',
      header: 'Alta',
      sortField: 'createdAt',
      cell: (customer) => formatDateTime(customer.createdAt),
      className: 'tabular-nums',
    },
  ]

  // Acciones de escritura: solo ADMIN (un USER ni las ve). Eliminar se agrega en D-07.
  if (canEdit) {
    columns.push({
      key: 'actions',
      header: 'Acciones',
      className: 'text-right',
      cell: (customer) => (
        <Link
          to={`/customers/${customer.id}/edit`}
          state={listState}
          aria-label={`Editar a ${customer.name} ${customer.lastName}`}
          className="text-sm font-medium text-accent-strong underline-offset-2 hover:underline"
        >
          Editar
        </Link>
      ),
    })
  }

  return (
    <DataTable
      caption="Clientes"
      columns={columns}
      rows={customers}
      getRowId={(customer) => customer.id}
      sort={sort}
      onSortChange={onSortChange}
      isDimmed={isDimmed}
      empty={empty}
    />
  )
}
