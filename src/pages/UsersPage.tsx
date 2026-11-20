import { FiltersLayout } from '../components/filters/FiltersLayout.tsx'
import { SearchField } from '../components/filters/SearchField.tsx'
import { Button } from '../components/ui/Button.tsx'
import { EmptyState } from '../components/ui/EmptyState.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { Pagination } from '../components/ui/Pagination.tsx'
import { Spinner } from '../components/ui/Spinner.tsx'
import { UserFilters } from '../components/users/UserFilters.tsx'
import { UserTable } from '../components/users/UserTable.tsx'
import { useAuth } from '../hooks/useAuth.ts'
import { useUserFilters } from '../hooks/useUserFilters.ts'
import { useUsersPage } from '../hooks/useUsers.ts'
import { errorMessage } from '../lib/errors.ts'
import { PAGE_SIZES } from '../schemas/common.ts'

// Listado de usuarios (solo ADMIN: la ruta está dentro de RequireRole). Mismo patrón que el de
// clientes: filtros en la URL, datos con TanStack Query y sin useEffect.
export function UsersPage() {
  const { filters, setFilters, clearFilters, activeCount, hasFilters, resetKey } = useUserFilters()
  const users = useUsersPage(filters)
  const { user: me } = useAuth()
  const data = users.data

  const isPageOutOfRange = data !== undefined && data.content.length === 0 && filters.page > 1

  const emptyState = isPageOutOfRange ? (
    <EmptyState
      title="Esta página no existe"
      description={`El listado tiene ${data.page.totalPages} ${data.page.totalPages === 1 ? 'página' : 'páginas'}.`}
      action={<Button onClick={() => setFilters({ page: 1 })}>Ir a la primera página</Button>}
    />
  ) : (
    // Siempre hay al menos un usuario (quien mira), así que la lista vacía solo ocurre con filtros.
    <EmptyState
      title="No hay usuarios con estos filtros"
      description="Prueba con otro email o quita alguno de los filtros."
      action={
        hasFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        )
      }
    />
  )

  return (
    <>
      <PageHeader title="Usuarios" description="Quién puede entrar a Cartera y con qué rol." />

      <FiltersLayout
        activeCount={activeCount}
        onClear={clearFilters}
        filters={<UserFilters filters={filters} onChange={setFilters} />}
      >
        <div className="space-y-4">
          <SearchField
            key={resetKey}
            label="Buscar usuarios"
            placeholder="Buscar por email"
            value={filters.search}
            onSearch={(search) => setFilters({ search })}
          />

          {users.isError && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
            >
              <p>{errorMessage(users.error, 'No se pudieron cargar los usuarios.')}</p>
              <Button size="sm" onClick={() => users.refetch()} isPending={users.isFetching}>
                Reintentar
              </Button>
            </div>
          )}

          {users.isPending && (
            <div className="flex items-center justify-center gap-3 rounded-panel border border-line bg-surface py-16 text-sm text-ink-muted">
              <Spinner className="size-5" /> Cargando usuarios…
            </div>
          )}

          {data && (
            <>
              <UserTable
                users={data.content}
                currentUserId={me?.id}
                sort={filters.sort}
                onSortChange={(sort) => setFilters({ sort })}
                isDimmed={users.isPlaceholderData}
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
