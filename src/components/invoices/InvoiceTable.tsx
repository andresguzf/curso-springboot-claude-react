import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { formatDate, formatMoney } from '../../lib/format.ts'
import type { Invoice } from '../../schemas/invoice.ts'
import { DataTable, type DataTableColumn } from '../ui/DataTable.tsx'
import { InvoiceStatusBadge } from './InvoiceStatusBadge.tsx'

type InvoiceTableProps = {
  invoices: Invoice[]
  sort: string
  onSortChange: (sort: string) => void
  isDimmed?: boolean
  empty?: ReactNode
  /** Oculta la columna del cliente (la sección de facturas dentro de su ficha). */
  hideCustomer?: boolean
}

// Tabla de facturas. El número enlaza al detalle con el query string actual en el state, para que
// "Volver a facturas" regrese con los mismos filtros y en la misma página.
export function InvoiceTable({ invoices, sort, onSortChange, isDimmed, empty, hideCustomer = false }: InvoiceTableProps) {
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
