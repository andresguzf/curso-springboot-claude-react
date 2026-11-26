import { Link } from 'react-router'
import { useCustomer } from '../../hooks/useCustomers.ts'
import { useInvoiceStats } from '../../hooks/useInvoices.ts'
import { errorMessage } from '../../lib/errors.ts'
import { formatDate } from '../../lib/format.ts'
import type { StatsFilters as Filters } from '../../schemas/invoice.ts'
import { Button } from '../ui/Button.tsx'
import { buttonClassName } from '../ui/buttonStyles.ts'
import { EmptyState } from '../ui/EmptyState.tsx'
import { BalanceBar } from './BalanceBar.tsx'
import { MonthlyChart } from './MonthlyChart.tsx'
import { StatsFilters } from './StatsFilters.tsx'
import { StatusChart } from './StatusChart.tsx'
import { TopCustomers } from './TopCustomers.tsx'

// Esqueleto con la forma de cada pieza (cifra y barra, columnas, círculo, filas): la página no salta
// cuando llegan los datos. El pulso se apaga con prefers-reduced-motion.
function BillingSkeleton() {
  return (
    <div aria-busy="true">
      <span role="status" className="sr-only">
        Cargando la facturación
      </span>
      <div aria-hidden="true" className="animate-pulse space-y-5 motion-reduce:animate-none">
        <div className="h-7 w-56 rounded-control bg-canvas" />
        <div className="h-6 rounded-control bg-canvas" />
        <div className="grid gap-6 border-t border-line pt-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="flex h-56 items-end gap-2">
            {[30, 45, 20, 60, 35, 80, 50, 25, 70, 40, 90, 55].map((height, index) => (
              <div key={index} className="flex-1 rounded-t-[3px] bg-canvas" style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="size-32 rounded-full border-[14px] border-canvas" />
        </div>
      </div>
    </div>
  )
}

// Qué se está viendo, en una frase: "Facturas de Ana Pérez emitidas entre el 01-01-2026 y el 30-06-2026".
function describeFilters(filters: Filters, customerName: string | undefined): string {
  const who = customerName ? `Facturas de ${customerName}` : 'Facturas de todos los clientes'
  const { issuedFrom, issuedTo } = filters
  if (issuedFrom && issuedTo) return `${who} emitidas entre el ${formatDate(issuedFrom)} y el ${formatDate(issuedTo)}.`
  if (issuedFrom) return `${who} emitidas desde el ${formatDate(issuedFrom)}.`
  if (issuedTo) return `${who} emitidas hasta el ${formatDate(issuedTo)}.`
  return `${who}; por mes, los últimos 12 meses.`
}

type BillingSectionProps = {
  /** ADMIN: el estado vacío ofrece «Nueva factura». */
  canCreate: boolean
  /** Filtros de la URL (useStatsFilters) y sus acciones. */
  filters: Filters
  onFiltersChange: (patch: Partial<Filters>) => void
  onClearFilters: () => void
  hasFilters: boolean
  resetKey: number
}

// Sección «Facturación» del resumen (spec 11, dirección visual aprobada en K-07; filtros, spec 12):
// barra de filtros, balance, facturación por mes, facturas por estado y ranking de clientes, en un solo
// panel. Los datos vienen de GET /api/invoices/stats con los filtros (invoiceKeys.stats, bajo
// invoiceKeys.all: se refresca con cada mutación de facturas o de clientes).
export function BillingSection({
  canCreate,
  filters,
  onFiltersChange,
  onClearFilters,
  hasFilters,
  resetKey,
}: BillingSectionProps) {
  const stats = useInvoiceStats(filters)
  // El nombre del cliente filtrado para la frase (misma consulta que el chip de la barra: una sola petición).
  const customer = useCustomer(filters.customerId ?? 0)
  const customerName = customer.data ? `${customer.data.name} ${customer.data.lastName}` : undefined
  const data = stats.data

  return (
    <section aria-labelledby="billing" className="rounded-panel border border-line bg-surface p-5 sm:p-6">
      <h2 id="billing" className="text-[1.25rem] font-semibold text-ink">
        Facturación
      </h2>
      <p className="mt-1 mb-4 text-sm text-ink-muted" aria-live="polite">
        {describeFilters(filters, customerName)}
      </p>

      <div className="mb-6 border-b border-line pb-5">
        <StatsFilters
          filters={filters}
          onChange={onFiltersChange}
          onClear={onClearFilters}
          hasFilters={hasFilters}
          resetKey={resetKey}
        />
      </div>

      {stats.isPending && <BillingSkeleton />}

      {stats.isError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 text-sm text-danger">
          <p>{errorMessage(stats.error, 'No se pudo cargar la facturación.')}</p>
          <Button size="sm" onClick={() => stats.refetch()} isPending={stats.isFetching}>
            Reintentar
          </Button>
        </div>
      )}

      {data && data.invoiceCount === 0 && hasFilters && (
        <EmptyState
          title="No hay facturas con estos filtros"
          description="Prueba con otro cliente u otro rango de fechas."
          action={
            <Button variant="ghost" onClick={onClearFilters}>
              Limpiar filtros
            </Button>
          }
        />
      )}

      {data && data.invoiceCount === 0 && !hasFilters && (
        <EmptyState
          title="Todavía no hay facturas"
          description={
            canCreate ? 'Crea la primera y aquí verás el balance y la facturación por mes.' : 'Cuando se emita la primera, aquí verás el balance.'
          }
          action={
            canCreate && (
              <Link to="/invoices/new" className={buttonClassName({ variant: 'primary' })}>
                Nueva factura
              </Link>
            )
          }
        />
      )}

      {data && data.invoiceCount > 0 && (
        // Mientras llegan los datos de un filtro nuevo se ven los anteriores atenuados (sin parpadeo).
        <div
          aria-busy={stats.isPlaceholderData || undefined}
          className={`space-y-6 transition-opacity motion-reduce:transition-none ${stats.isPlaceholderData ? 'opacity-60' : ''}`}
        >
          <BalanceBar stats={data} filters={filters} />
          <div className="grid gap-6 border-t border-line pt-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <MonthlyChart monthly={data.monthly} filters={filters} />
            <StatusChart byStatus={data.byStatus} invoiceCount={data.invoiceCount} filters={filters} />
          </div>
          {/* Con un cliente elegido, el ranking tendría una sola fila: se oculta. */}
          {filters.customerId === undefined && data.topCustomers.length > 0 && (
            <div className="border-t border-line pt-5">
              <TopCustomers customers={data.topCustomers} filters={filters} />
            </div>
          )}
        </div>
      )}
    </section>
  )
}
