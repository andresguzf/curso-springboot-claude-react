import { Link } from 'react-router'
import { useInvoiceStats } from '../../hooks/useInvoices.ts'
import { errorMessage } from '../../lib/errors.ts'
import { Button } from '../ui/Button.tsx'
import { buttonClassName } from '../ui/buttonStyles.ts'
import { EmptyState } from '../ui/EmptyState.tsx'
import { BalanceBar } from './BalanceBar.tsx'
import { MonthlyChart } from './MonthlyChart.tsx'
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

type BillingSectionProps = {
  /** ADMIN: el estado vacío ofrece «Nueva factura». */
  canCreate: boolean
}

// Sección «Facturación» del resumen (spec 11, dirección visual aprobada en K-07): balance, facturación
// por mes, facturas por estado y ranking de clientes, en un solo panel. Los datos vienen de
// GET /api/invoices/stats (invoiceKeys.stats, bajo invoiceKeys.all: se refresca con cada mutación de
// facturas o de clientes).
export function BillingSection({ canCreate }: BillingSectionProps) {
  const stats = useInvoiceStats()

  return (
    <section aria-labelledby="billing" className="rounded-panel border border-line bg-surface p-5 sm:p-6">
      <h2 id="billing" className="mb-4 text-[1.25rem] font-semibold text-ink">
        Facturación
      </h2>

      {stats.isPending && <BillingSkeleton />}

      {stats.isError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 text-sm text-danger">
          <p>{errorMessage(stats.error, 'No se pudo cargar la facturación.')}</p>
          <Button size="sm" onClick={() => stats.refetch()} isPending={stats.isFetching}>
            Reintentar
          </Button>
        </div>
      )}

      {stats.data && stats.data.invoiceCount === 0 && (
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

      {stats.data && stats.data.invoiceCount > 0 && (
        <div className="space-y-6">
          <BalanceBar stats={stats.data} />
          <div className="grid gap-6 border-t border-line pt-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <MonthlyChart monthly={stats.data.monthly} />
            <StatusChart byStatus={stats.data.byStatus} invoiceCount={stats.data.invoiceCount} />
          </div>
          {stats.data.topCustomers.length > 0 && (
            <div className="border-t border-line pt-5">
              <TopCustomers customers={stats.data.topCustomers} />
            </div>
          )}
        </div>
      )}
    </section>
  )
}
