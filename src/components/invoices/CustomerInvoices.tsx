import { useState } from 'react'
import { Link } from 'react-router'
import { useInvoicesPage } from '../../hooks/useInvoices.ts'
import { errorMessage } from '../../lib/errors.ts'
import { invoiceFiltersSchema, type Invoice, type InvoiceFilters } from '../../schemas/invoice.ts'
import { Button } from '../ui/Button.tsx'
import { buttonClassName } from '../ui/buttonStyles.ts'
import { EmptyState } from '../ui/EmptyState.tsx'
import { TableSkeleton } from '../ui/TableSkeleton.tsx'
import { DeleteInvoiceDialog } from './DeleteInvoiceDialog.tsx'
import { InvoiceTable } from './InvoiceTable.tsx'

// Filtros por defecto del listado (orden por emisión descendente, 10 por página), sin filtros.
const DEFAULT_FILTERS = invoiceFiltersSchema.parse({})

type CustomerInvoicesProps = {
  customerId: number
  /** ADMIN: muestra «Nueva factura» y las acciones de editar y eliminar. */
  canEdit?: boolean
}

// Facturas de un cliente dentro de su ficha (USER y ADMIN): las 10 más recientes. Es el mismo
// listado de /invoices con customerId, así que comparte cache e invalidaciones; el orden es fijo y
// "Ver todas" abre el listado completo filtrado por este cliente.
export function CustomerInvoices({ customerId, canEdit = false }: CustomerInvoicesProps) {
  const filters: InvoiceFilters = { ...DEFAULT_FILTERS, customerId }
  const invoices = useInvoicesPage(filters)
  const data = invoices.data
  const listPath = `/invoices?customerId=${customerId}`
  const [toDelete, setToDelete] = useState<Invoice | null>(null)
  const newInvoiceLink = canEdit && (
    <Link to={`/invoices/new?customerId=${customerId}`} className={buttonClassName({ variant: 'primary', size: 'sm' })}>
      Nueva factura
    </Link>
  )

  return (
    <section aria-labelledby="customer-invoices" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="customer-invoices" className="text-base font-semibold text-ink">
          Facturas
          {data && data.page.totalElements > 0 && (
            <span className="ml-2 text-sm font-normal text-ink-muted tabular-nums">({data.page.totalElements})</span>
          )}
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          {data && data.page.totalElements > 0 && (
            <Link to={listPath} className="text-sm font-medium text-accent-strong underline underline-offset-2 hover:text-ink">
              {data.page.totalPages > 1 ? 'Ver todas las facturas' : 'Abrir en el listado'}
            </Link>
          )}
          {newInvoiceLink}
        </div>
      </div>

      {invoices.isError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          <p>{errorMessage(invoices.error, 'No se pudieron cargar las facturas del cliente.')}</p>
          <Button size="sm" onClick={() => invoices.refetch()} isPending={invoices.isFetching}>
            Reintentar
          </Button>
        </div>
      )}

      {invoices.isPending && <TableSkeleton label="Cargando facturas" columns={canEdit ? 6 : 5} rows={3} />}

      {data && (
        <InvoiceTable
          invoices={data.content}
          // Orden fijo (las más recientes, sin onSortChange); para ordenar o filtrar está el listado completo.
          sort={filters.sort}
          hideCustomer
          canEdit={canEdit}
          onDelete={canEdit ? setToDelete : undefined}
          empty={
            <EmptyState
              title="Este cliente todavía no tiene facturas"
              description={canEdit ? 'Crea la primera con «Nueva factura».' : undefined}
            />
          }
        />
      )}

      <DeleteInvoiceDialog
        key={toDelete?.id}
        invoice={toDelete}
        onCancel={() => setToDelete(null)}
        onDeleted={() => setToDelete(null)}
      />
    </section>
  )
}
