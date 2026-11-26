import { Link } from 'react-router'
import { formatMoney } from '../../lib/format.ts'
import { invoicesListPath } from '../../lib/statsRanges.ts'
import type { InvoiceStats, StatsFilters } from '../../schemas/invoice.ts'

const percentFormat = new Intl.NumberFormat('es-CL', { style: 'percent', maximumFractionDigits: 0 })

// Rayado de lo vencido: diagonal granate (coral en oscuro) sobre el tramo pendiente. No depende solo
// del color: el patrón distingue lo vencido aunque no se perciba el rojo.
const OVERDUE_PATTERN = 'repeating-linear-gradient(45deg, var(--color-danger) 0 2px, transparent 2px 6px)'

type BalanceBarProps = {
  stats: InvoiceStats
  /** Filtros del resumen: los enlaces los llevan al listado. */
  filters: StatsFilters
}

// Balance de lo facturado (K-07): una barra a todo el ancho que reparte lo facturado entre pagado y
// pendiente, con lo vencido rayado dentro de lo pendiente. Es el elemento llamativo del resumen; la
// barra es decorativa (aria-hidden) y la información accesible está en las leyendas, que son enlaces
// a los listados filtrados.
export function BalanceBar({ stats, filters }: BalanceBarProps) {
  const { billed, paid, pending, overdue, overdueCount, invoiceCount } = stats
  const cancelled = stats.byStatus.find((total) => total.status === 'CANCELLED')?.count ?? 0
  const share = (value: number) => (billed > 0 ? value / billed : 0)
  const overdueInPending = pending > 0 ? overdue / pending : 0

  const legends = [
    {
      key: 'paid',
      label: 'Pagado',
      amount: paid,
      detail: percentFormat.format(share(paid)),
      to: invoicesListPath(filters, { status: 'PAID' }),
      swatch: <span className="block size-3 rounded-[3px] bg-success" />,
    },
    {
      key: 'pending',
      label: 'Pendiente',
      amount: pending,
      detail: percentFormat.format(share(pending)),
      to: invoicesListPath(filters, { status: 'PENDING' }),
      swatch: <span className="block size-3 rounded-[3px] bg-warning" />,
    },
    {
      key: 'overdue',
      label: 'Vencido',
      amount: overdue,
      detail: overdueCount === 0 ? 'ninguna' : `${overdueCount} ${overdueCount === 1 ? 'factura' : 'facturas'}`,
      // No hay filtro de vencidas: las pendientes ordenadas por vencimiento muestran primero las vencidas.
      to: invoicesListPath(filters, { status: 'PENDING', sort: 'dueDate,asc' }),
      swatch: (
        <span className="block size-3 rounded-[3px] border border-danger" style={{ backgroundImage: OVERDUE_PATTERN }} />
      ),
    },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="text-sm text-ink-muted">Facturado</span>
        <span className="text-[1.75rem] leading-none font-semibold text-ink tabular-nums">{formatMoney(billed)}</span>
        <span className="text-[0.8125rem] text-ink-muted">
          {invoiceCount} {invoiceCount === 1 ? 'factura emitida' : 'facturas emitidas'}
          {cancelled > 0 && `; ${cancelled} ${cancelled === 1 ? 'anulada no suma' : 'anuladas no suman'}`}
        </span>
      </div>

      {/* Decorativa: con el puntero cada tramo abre su listado; con teclado y lector, las leyendas. */}
      <div aria-hidden="true" className="mt-3 flex h-6 overflow-hidden rounded-control bg-canvas">
        {paid > 0 && (
          <Link to={legends[0].to} tabIndex={-1} className="bg-success" style={{ width: `${share(paid) * 100}%` }} />
        )}
        {pending > 0 && (
          <Link
            to={legends[1].to}
            tabIndex={-1}
            className="relative bg-warning"
            style={{ width: `${share(pending) * 100}%` }}
          >
            {overdue > 0 && (
              <span
                className="absolute inset-y-0 left-0 bg-surface/40"
                style={{ width: `${overdueInPending * 100}%`, backgroundImage: OVERDUE_PATTERN }}
              />
            )}
          </Link>
        )}
      </div>

      <ul className="mt-3 grid gap-3 sm:grid-cols-3">
        {legends.map((legend) => (
          <li key={legend.key}>
            <Link
              to={legend.to}
              aria-label={`${legend.label}: ${formatMoney(legend.amount)}, ${legend.detail}`}
              className="group flex items-start gap-2 rounded-control py-1"
            >
              <span aria-hidden="true" className="mt-1">
                {legend.swatch}
              </span>
              <span aria-hidden="true">
                <span className="block text-sm text-ink-muted group-hover:text-ink">{legend.label}</span>
                <span className="text-base font-semibold text-ink tabular-nums">{formatMoney(legend.amount)}</span>{' '}
                <span className="text-sm text-ink-muted">{legend.detail}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
