import { Pencil, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { formatDate, formatMoney } from '../../lib/format.ts'
import type { Invoice } from '../../schemas/invoice.ts'
import { DataTable, type DataTableColumn } from '../ui/DataTable.tsx'
import { IconButton, IconLink } from '../ui/IconButton.tsx'
import { InvoiceStatusBadge } from './InvoiceStatusBadge.tsx'

type InvoiceTableProps = {
  invoices: Invoice[]
  sort: string
  /** Sin callback, los encabezados no ordenan (la sección de la ficha del cliente tiene orden fijo). */
  onSortChange?: (sort: string) => void
  isDimmed?: boolean
  empty?: ReactNode
  /** Oculta la columna del cliente (la sección de facturas dentro de su ficha). */
  hideCustomer?: boolean
  /** ADMIN: muestra las acciones de escritura por fila. */
  canEdit?: boolean
  /** Pide eliminar una factura; el padre abre el modal de confirmación. */
  onDelete?: (invoice: Invoice) => void
}

// Tabla de facturas. El número enlaza al detalle con el query string actual en el state, para que
// "Volver a facturas" regrese con los mismos filtros y en la misma página.
export function InvoiceTable({
  invoices,
  sort,
  onSortChange,
  isDimmed,
  empty,
  hideCustomer = false,
  canEdit = false,
  onDelete,
}: InvoiceTableProps) {
  const location = useLocation()
  const listState = { listSearch: location.search }

  const columns: DataTableColumn<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Número',
      sortField: 'invoiceNumber',
      cell: (invoice) => (
        <Link
          to={`/invoices/${invoice.id}`}
          state={listState}
          className="font-medium whitespace-nowrap text-ink tabular-nums underline-offset-2 hover:underline"
        >
          {invoice.invoiceNumber}
        </Link>
      ),
    },
    // Prioridad de columnas (spec 07): número, estado y total siempre; el resto según el ancho del
    // contenedor de la tabla.
    ...(hideCustomer
      ? []
      : [
          {
            key: 'customer',
            header: 'Cliente',
            minWidth: 'md',
            cell: (invoice: Invoice) => (
              <Link to={`/customers/${invoice.customerId}`} className="text-ink underline-offset-2 hover:underline">
                {invoice.customerName}
              </Link>
            ),
          } satisfies DataTableColumn<Invoice>,
        ]),
    {
      key: 'issueDate',
      header: 'Emisión',
      sortField: 'issueDate',
      minWidth: 'xl',
      cell: (invoice) => formatDate(invoice.issueDate),
      className: 'tabular-nums',
    },
    {
      key: 'dueDate',
      header: 'Vencimiento',
      sortField: 'dueDate',
      minWidth: '3xl',
      cell: (invoice) => formatDate(invoice.dueDate),
      className: 'tabular-nums',
    },
    {
      key: 'status',
      header: 'Estado',
      sortField: 'status',
      cell: (invoice) => <InvoiceStatusBadge status={invoice.status} />,
    },
    {
      key: 'total',
      header: 'Total',
      sortField: 'total',
      cell: (invoice) => formatMoney(invoice.total),
      className: 'text-right whitespace-nowrap tabular-nums',
    },
  ]

  // Acciones de escritura: solo ADMIN (un USER ni las ve).
  if (canEdit) {
    columns.push({
      key: 'actions',
      header: 'Acciones',
      className: 'text-right',
      cell: (invoice) => (
        <div className="flex items-center justify-end gap-1">
          <IconLink
            to={`/invoices/${invoice.id}/edit`}
            state={listState}
            label={`Editar la factura ${invoice.invoiceNumber}`}
            icon={Pencil}
          />
          {onDelete && (
            <IconButton
              label={`Eliminar la factura ${invoice.invoiceNumber}`}
              icon={Trash2}
              tone="danger"
              onClick={() => onDelete(invoice)}
            />
          )}
        </div>
      ),
    })
  }

  return (
    <DataTable
      caption="Facturas"
      columns={columns}
      rows={invoices}
      getRowId={(invoice) => invoice.id}
      sort={sort}
      onSortChange={onSortChange}
      isDimmed={isDimmed}
      empty={empty}
    />
  )
}
