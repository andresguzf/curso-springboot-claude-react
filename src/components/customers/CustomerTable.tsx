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
}

// Tabla de clientes. El nombre enlaza al detalle y lleva el query string actual en el state,
// para que "Volver a clientes" regrese con los mismos filtros y en la misma página.
export function CustomerTable({ customers, sort, onSortChange, isDimmed, empty }: CustomerTableProps) {
  const location = useLocation()

  const columns: DataTableColumn<Customer>[] = [
    {
      key: 'name',
      header: 'Nombre',
      sortField: 'lastName',
      cell: (customer) => (
        <Link
          to={`/customers/${customer.id}`}
          state={{ listSearch: location.search }}
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
