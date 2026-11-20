import { CustomerFilters } from '../components/customers/CustomerFilters.tsx'
import { CustomerSearch } from '../components/customers/CustomerSearch.tsx'
import { CustomerTable } from '../components/customers/CustomerTable.tsx'
import { FiltersLayout } from '../components/filters/FiltersLayout.tsx'
import { Link, useLocation } from 'react-router'
import { Button } from '../components/ui/Button.tsx'
import { buttonClassName } from '../components/ui/buttonStyles.ts'
import { EmptyState } from '../components/ui/EmptyState.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { Pagination } from '../components/ui/Pagination.tsx'
import { Spinner } from '../components/ui/Spinner.tsx'
import { useAuth } from '../hooks/useAuth.ts'
import { useCustomerFilters } from '../hooks/useCustomerFilters.ts'
import { useCustomersPage } from '../hooks/useCustomers.ts'
import { errorMessage } from '../lib/errors.ts'
import { PAGE_SIZES } from '../schemas/customer.ts'

// Listado de clientes: orquesta los filtros (en la URL), la consulta a la API y los componentes.
// Sin useEffect: los datos vienen de TanStack Query y cada cambio sale de un handler.
export function CustomersPage() {
  const { filters, setFilters, clearFilters, activeCount, hasFilters, resetKey } = useCustomerFilters()
  const customers = useCustomersPage(filters)
  const { isAdmin } = useAuth()
  const location = useLocation()
  const data = customers.data

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
    <EmptyState title="Todavía no hay clientes" description="Cuando se registre el primero, aparecerá aquí." />
  )

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Busca, filtra y ordena la cartera de clientes."
        actions={
          isAdmin && (
            <Link
              to="/customers/new"
              state={{ listSearch: location.search }}
              className={buttonClassName({ variant: 'primary' })}
            >
              Nuevo cliente
            </Link>
          )
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

          {customers.isPending && (
            <div className="flex items-center justify-center gap-3 rounded-panel border border-line bg-surface py-16 text-sm text-ink-muted">
              <Spinner className="size-5" /> Cargando clientes…
            </div>
          )}

          {data && (
            <>
              <CustomerTable
                customers={data.content}
                sort={filters.sort}
                onSortChange={(sort) => setFilters({ sort })}
                isDimmed={customers.isPlaceholderData}
                canEdit={isAdmin}
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
    </>
  )
}
