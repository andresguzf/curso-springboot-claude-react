import { X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { FiltersLayout } from '../components/filters/FiltersLayout.tsx'
import { SearchField } from '../components/filters/SearchField.tsx'
import { DeleteInvoiceDialog } from '../components/invoices/DeleteInvoiceDialog.tsx'
import { InvoiceFilters } from '../components/invoices/InvoiceFilters.tsx'
import { InvoiceTable } from '../components/invoices/InvoiceTable.tsx'
import { Button } from '../components/ui/Button.tsx'
import { buttonClassName } from '../components/ui/buttonStyles.ts'
import { EmptyState } from '../components/ui/EmptyState.tsx'
import { IconButton } from '../components/ui/IconButton.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { Pagination } from '../components/ui/Pagination.tsx'
import { TableSkeleton } from '../components/ui/TableSkeleton.tsx'
import { useAuth } from '../hooks/useAuth.ts'
import { useCustomer } from '../hooks/useCustomers.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { useInvoiceFilters } from '../hooks/useInvoiceFilters.ts'
import { useInvoicesPage } from '../hooks/useInvoices.ts'
import { errorMessage } from '../lib/errors.ts'
import { PAGE_SIZES } from '../schemas/common.ts'
import type { Invoice } from '../schemas/invoice.ts'

// Listado de facturas de todos los clientes (USER y ADMIN): orquesta los filtros (en la URL), la
// consulta a la API y los componentes. ADMIN crea facturas con «Nueva factura» (o desde la ficha del cliente).
export function InvoicesPage() {
  useDocumentTitle('Facturas')
  const { filters, setFilters, clearFilters, activeCount, hasFilters, resetKey } = useInvoiceFilters()
  const invoices = useInvoicesPage(filters)
  const { isAdmin } = useAuth()
  const location = useLocation()
  const data = invoices.data
  // Nombre del cliente filtrado (?customerId=), para el chip. Sin filtro, la consulta no corre (id 0).
  const customer = useCustomer(filters.customerId ?? 0)

  // Factura que se está por eliminar (modal abierto) o null. Estado local: solo le importa a esta página.
  const [toDelete, setToDelete] = useState<Invoice | null>(null)

  function handleDeleted() {
    // Si era la única fila de una página que no es la primera, esa página quedó vacía: se pasa a la
    // anterior (en el handler, no en un effect).
    const leftPageEmpty = data?.content.length === 1 && filters.page > 1
    setToDelete(null)
    if (leftPageEmpty) setFilters({ page: filters.page - 1 })
  }

  // Página fuera de rango (?page=99 o tras borrar la última factura de la última página).
  const isPageOutOfRange = data !== undefined && data.content.length === 0 && filters.page > 1

  const emptyState = isPageOutOfRange ? (
    <EmptyState
      title="Esta página no existe"
      description={`El listado tiene ${data.page.totalPages} ${data.page.totalPages === 1 ? 'página' : 'páginas'}.`}
      action={<Button onClick={() => setFilters({ page: 1 })}>Ir a la primera página</Button>}
    />
  ) : hasFilters ? (
    <EmptyState
      title="No hay facturas con estos filtros"
      description="Prueba con otro texto de búsqueda o quita alguno de los filtros."
      action={
        <Button variant="ghost" onClick={clearFilters}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      title="Todavía no hay facturas"
      description={
        isAdmin ? 'Crea la primera con «Nueva factura».' : 'Cuando se emita la primera, aparecerá aquí.'
      }
      action={
        isAdmin && (
          <Link to="/invoices/new" className={buttonClassName({ variant: 'primary' })}>
            Nueva factura
          </Link>
        )
      }
    />
  )

  const customerLabel = customer.data ? `${customer.data.name} ${customer.data.lastName}` : `#${filters.customerId}`

  return (
    <>
      <PageHeader
        title="Facturas"
        description="Busca, filtra y ordena las facturas de todos los clientes."
        actions={
          isAdmin && (
            // El state lleva los filtros: «Cancelar» del alta vuelve al listado tal como estaba.
            <Link to="/invoices/new" state={{ listSearch: location.search }} className={buttonClassName({ variant: 'primary' })}>
              Nueva factura
            </Link>
          )
        }
      />

      <FiltersLayout
        activeCount={activeCount}
        onClear={clearFilters}
        // key={resetKey}: al limpiar, los campos se remontan y descartan lo que se estaba escribiendo.
        filters={<InvoiceFilters key={resetKey} filters={filters} onChange={setFilters} />}
      >
        <div className="space-y-4">
          <SearchField
            key={resetKey}
            label="Buscar facturas"
            placeholder="Buscar por número o cliente (nombre, apellido o email)"
            value={filters.search}
            onSearch={(search) => setFilters({ search })}
          />

          {/* Filtro por cliente (llega desde su ficha): no tiene campo en el sidebar, se quita aquí. */}
          {filters.customerId !== undefined && (
            <p className="inline-flex items-center gap-1 rounded-control border border-line bg-surface py-0.5 pr-0.5 pl-3 text-sm text-ink">
              <span>
                <span className="text-ink-muted">Cliente:</span>{' '}
                <Link to={`/customers/${filters.customerId}`} className="font-medium underline-offset-2 hover:underline">
                  {customerLabel}
                </Link>
              </span>
              <IconButton
                label={`Quitar el filtro por el cliente ${customerLabel}`}
                icon={X}
                onClick={() => setFilters({ customerId: undefined })}
              />
            </p>
          )}

          {invoices.isError && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
            >
              <p>{errorMessage(invoices.error, 'No se pudieron cargar las facturas.')}</p>
              <Button size="sm" onClick={() => invoices.refetch()} isPending={invoices.isFetching}>
                Reintentar
              </Button>
            </div>
          )}

          {invoices.isPending && <TableSkeleton label="Cargando facturas" columns={isAdmin ? 7 : 6} />}

          {data && (
            <>
              <InvoiceTable
                invoices={data.content}
                sort={filters.sort}
                onSortChange={(sort) => setFilters({ sort })}
                isDimmed={invoices.isPlaceholderData}
                canEdit={isAdmin}
                onDelete={isAdmin ? setToDelete : undefined}
                empty={emptyState}
              />
              {!isPageOutOfRange && (
                <Pagination
                  page={filters.page}
                  size={filters.size}
                  totalElements={data.page.totalElements}
                  totalPages={data.page.totalPages}
                  sizes={PAGE_SIZES}
                  onPageChange={(page) => setFilters({ page })}
                  onSizeChange={(size) => setFilters({ size })}
                />
              )}
            </>
          )}
        </div>
      </FiltersLayout>

      <DeleteInvoiceDialog
        key={toDelete?.id}
        invoice={toDelete}
        onCancel={() => setToDelete(null)}
        onDeleted={handleDeleted}
      />
    </>
  )
}
