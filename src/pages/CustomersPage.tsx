import { CustomerFilters } from '../components/customers/CustomerFilters.tsx'
import { CustomerSearch } from '../components/customers/CustomerSearch.tsx'
import { CustomerTable } from '../components/customers/CustomerTable.tsx'
import { ExportMenu } from '../components/customers/ExportMenu.tsx'
import { FiltersLayout } from '../components/filters/FiltersLayout.tsx'
import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Button } from '../components/ui/Button.tsx'
import { buttonClassName } from '../components/ui/buttonStyles.ts'
import { ConfirmDialog } from '../components/ui/ConfirmDialog.tsx'
import { EmptyState } from '../components/ui/EmptyState.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { Pagination } from '../components/ui/Pagination.tsx'
import { TableSkeleton } from '../components/ui/TableSkeleton.tsx'
import { useAuth } from '../hooks/useAuth.ts'
import { useCustomerFilters } from '../hooks/useCustomerFilters.ts'
import { useCustomersPage, useDeleteCustomer } from '../hooks/useCustomers.ts'
import { useExportCustomers } from '../hooks/useExportCustomers.ts'
import { useInvoiceCount } from '../hooks/useInvoices.ts'
import { errorMessage } from '../lib/errors.ts'
import { PAGE_SIZES } from '../schemas/common.ts'
import type { Customer } from '../schemas/customer.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'

// Texto del modal de eliminar: avisa las facturas que se eliminan con el cliente. Mientras se cuentan
// (undefined) o si no tiene, el texto de siempre.
function deleteDescription(invoices: number | undefined): string {
  if (!invoices) return 'Esta acción no se puede deshacer.'
  const which = invoices === 1 ? 'se eliminará su factura' : `se eliminarán sus ${invoices} facturas`
  return `También ${which}, con sus líneas. Esta acción no se puede deshacer.`
}

// Listado de clientes: orquesta los filtros (en la URL), la consulta a la API y los componentes.
// Sin useEffect: los datos vienen de TanStack Query y cada cambio sale de un handler.
export function CustomersPage() {
  useDocumentTitle('Clientes')
  const { filters, setFilters, clearFilters, activeCount, hasFilters, resetKey } = useCustomerFilters()
  const customers = useCustomersPage(filters)
  const { isAdmin } = useAuth()
  const location = useLocation()
  const data = customers.data

  // Cliente que se está por eliminar (modal abierto) o null. Estado local: solo le importa a esta página.
  const [toDelete, setToDelete] = useState<Customer | null>(null)
  const deleteCustomer = useDeleteCustomer()
  // Facturas del cliente que se está por eliminar: se eliminan con él (borrado lógico, spec 11).
  const invoiceCount = useInvoiceCount(toDelete?.id)
  const exportCustomers = useExportCustomers()

  function openDelete(customer: Customer) {
    deleteCustomer.reset() // sin el error de un intento anterior
    setToDelete(customer)
  }

  function confirmDelete() {
    if (!toDelete) return
    // Se decide antes de borrar: si era la única fila de una página que no es la primera,
    // esa página quedará vacía y se pasa a la anterior (en el handler, no en un effect).
    const leavesPageEmpty = data?.content.length === 1 && filters.page > 1
    deleteCustomer.mutate(toDelete.id, {
      onSuccess: () => {
        setToDelete(null)
        if (leavesPageEmpty) setFilters({ page: filters.page - 1 })
      },
    })
  }

  // Página fuera de rango (?page=99 o tras borrar el último registro de la última página).
  const isPageOutOfRange = data !== undefined && data.content.length === 0 && filters.page > 1

  const emptyState = isPageOutOfRange ? (
    <EmptyState
      title="Esta página no existe"
      description={`El listado tiene ${data.page.totalPages} ${data.page.totalPages === 1 ? 'página' : 'páginas'}.`}
      action={<Button onClick={() => setFilters({ page: 1 })}>Ir a la primera página</Button>}
    />
  ) : hasFilters ? (
    <EmptyState
      title="No hay clientes con estos filtros"
      description="Prueba con otro texto de búsqueda o quita alguno de los filtros."
      action={
        <Button variant="ghost" onClick={clearFilters}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      title="Todavía no hay clientes"
      description={isAdmin ? 'Registra el primero para empezar la cartera.' : 'Cuando se registre el primero, aparecerá aquí.'}
      action={
        isAdmin && (
          <Link to="/customers/new" className={buttonClassName({ variant: 'primary' })}>
            Nuevo cliente
          </Link>
        )
      }
    />
  )

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Busca, filtra y ordena la cartera de clientes."
        actions={
          <>
            {/* Exporta todo el resultado filtrado y ordenado, no solo la página visible (USER y ADMIN). */}
            <ExportMenu
              onExport={(format) => exportCustomers.mutate({ filters, format })}
              pendingFormat={exportCustomers.isPending ? exportCustomers.variables.format : undefined}
            />
            {isAdmin && (
              <Link
                to="/customers/new"
                state={{ listSearch: location.search }}
                className={buttonClassName({ variant: 'primary' })}
              >
                Nuevo cliente
              </Link>
            )}
          </>
        }
      />

      <FiltersLayout
        activeCount={activeCount}
        onClear={clearFilters}
        // key={resetKey}: al limpiar, los campos se remontan y descartan lo que se estaba escribiendo.
        filters={<CustomerFilters key={resetKey} filters={filters} onChange={setFilters} />}
      >
        <div className="space-y-4">
          <CustomerSearch key={resetKey} value={filters.search} onSearch={(search) => setFilters({ search })} />

          {customers.isError && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
            >
              <p>{errorMessage(customers.error, 'No se pudieron cargar los clientes.')}</p>
              <Button size="sm" onClick={() => customers.refetch()} isPending={customers.isFetching}>
                Reintentar
              </Button>
            </div>
          )}

          {customers.isPending && <TableSkeleton label="Cargando clientes" columns={8} />}

          {data && (
            <>
              <CustomerTable
                customers={data.content}
                sort={filters.sort}
                onSortChange={(sort) => setFilters({ sort })}
                isDimmed={customers.isPlaceholderData}
                canEdit={isAdmin}
                onDelete={isAdmin ? openDelete : undefined}
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

      <ConfirmDialog
        open={toDelete !== null}
        title={toDelete ? `¿Eliminar a «${toDelete.name} ${toDelete.lastName}»?` : ''}
        description={deleteDescription(invoiceCount.data)}
        confirmLabel="Eliminar"
        tone="danger"
        isPending={deleteCustomer.isPending}
        error={
          deleteCustomer.isError
            ? errorMessage(deleteCustomer.error, 'No se pudo eliminar el cliente. Inténtalo de nuevo.')
            : null
        }
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
