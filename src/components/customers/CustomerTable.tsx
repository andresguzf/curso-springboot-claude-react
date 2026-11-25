import type { ReactNode } from 'react'
import { Pencil, ReceiptText, Trash2 } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { formatDate, formatDay } from '../../lib/format.ts'
import type { Customer } from '../../schemas/customer.ts'
import { Badge } from '../ui/Badge.tsx'
import { DataTable, type DataTableColumn } from '../ui/DataTable.tsx'
import { IconButton, IconLink } from '../ui/IconButton.tsx'

type CustomerTableProps = {
  customers: Customer[]
  sort: string
  onSortChange: (sort: string) => void
  isDimmed?: boolean
  empty?: ReactNode
  /** ADMIN: además de «Ver facturas», muestra las acciones de escritura por fila. */
  canEdit?: boolean
  /** Pide eliminar un cliente; el padre abre el modal de confirmación. */
  onDelete?: (customer: Customer) => void
}

// Tabla de clientes. El nombre enlaza al detalle y lleva el query string actual en el state,
// para que "Volver a clientes" regrese con los mismos filtros y en la misma página.
export function CustomerTable({ customers, sort, onSortChange, isDimmed, empty, canEdit = false, onDelete }: CustomerTableProps) {
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
    // Prioridad de columnas (spec 07): nombre, estado y acciones siempre; el resto según el ancho
    // del contenedor de la tabla (medido: con el sidebar abierto a 1024 px hay ~710 px).
    {
      key: 'email',
      header: 'Email',
      sortField: 'email',
      minWidth: 'md',
      cell: (customer) => (
        <span className="block max-w-48 truncate" title={customer.email}>
          {customer.email}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Teléfono',
      minWidth: '5xl',
      cell: (customer) => customer.phone,
      className: 'tabular-nums',
    },
    { key: 'city', header: 'Ciudad', sortField: 'city', minWidth: '2xl', cell: (customer) => customer.city },
    {
      key: 'birthDate',
      header: 'Nacimiento',
      sortField: 'birthDate',
      minWidth: '3xl',
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
      minWidth: '4xl',
      cell: (customer) => formatDay(customer.createdAt),
      className: 'tabular-nums',
    },
  ]

  // Acciones por fila. «Ver facturas» para todos (USER y ADMIN leen facturas, spec 11): abre el
  // listado de facturas filtrado por el cliente. Editar y eliminar, solo ADMIN (un USER ni los ve).
  columns.push({
    key: 'actions',
    header: 'Acciones',
    className: 'text-right',
    cell: (customer) => (
      <div className="flex items-center justify-end gap-1">
        <IconLink
          to={`/invoices?customerId=${customer.id}`}
          label={`Ver facturas de ${customer.name} ${customer.lastName}`}
          icon={ReceiptText}
        />
        {canEdit && (
          <IconLink
            to={`/customers/${customer.id}/edit`}
            state={listState}
            label={`Editar a ${customer.name} ${customer.lastName}`}
            icon={Pencil}
          />
        )}
        {canEdit && onDelete && (
          <IconButton
            label={`Eliminar a ${customer.name} ${customer.lastName}`}
            icon={Trash2}
            tone="danger"
            onClick={() => onDelete(customer)}
          />
        )}
      </div>
    ),
  })

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
