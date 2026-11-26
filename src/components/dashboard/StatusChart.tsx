import { Link } from 'react-router'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { formatMoney } from '../../lib/format.ts'
import type { InvoiceStats, InvoiceStatus } from '../../schemas/invoice.ts'

// Los colores de estado que ya usan los badges; la anulada en neutro porque no suma a los importes.
const STATUS_COLORS: Record<InvoiceStatus, string> = {
  PENDING: 'var(--color-warning)',
  PAID: 'var(--color-success)',
  CANCELLED: 'var(--color-line-strong)',
}

// Plural en minúscula para la leyenda: "3 pendientes", "1 pagada".
const STATUS_NOUNS: Record<InvoiceStatus, [string, string]> = {
  PENDING: ['pendiente', 'pendientes'],
  PAID: ['pagada', 'pagadas'],
  CANCELLED: ['anulada', 'anuladas'],
}

type StatusChartProps = {
  byStatus: InvoiceStats['byStatus']
  invoiceCount: number
}

// Cuántas facturas hay en cada estado (K-07): una dona con el total al centro y, al lado, la leyenda
// con un enlace por estado al listado filtrado. La dona es decorativa: la leyenda lleva los números.
export function StatusChart({ byStatus, invoiceCount }: StatusChartProps) {
  const slices = byStatus.filter((total) => total.count > 0)

  return (
    <figure className="min-w-0">
      <figcaption className="mb-2 text-sm font-semibold text-ink">Facturas por estado</figcaption>
      <div className="flex flex-wrap items-center gap-5">
        <div aria-hidden="true" className="relative size-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart accessibilityLayer={false}>
              <Pie
                data={slices}
                dataKey="count"
                nameKey="status"
                innerRadius="62%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                stroke="var(--color-surface)"
                strokeWidth={2}
                isAnimationActive={false}
                // La dona es decorativa (aria-hidden): sin esto Recharts la deja enfocable con Tab.
                rootTabIndex={-1}
              >
                {slices.map((slice) => (
                  <Cell key={slice.status} fill={STATUS_COLORS[slice.status]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center text-center leading-tight">
            <span>
              <span className="block text-xl font-semibold text-ink tabular-nums">{invoiceCount}</span>
              <span className="text-xs text-ink-muted">{invoiceCount === 1 ? 'factura' : 'facturas'}</span>
            </span>
          </div>
        </div>
        <ul className="space-y-1.5 text-sm">
          {byStatus.map((total) => (
            <li key={total.status}>
              <Link
                to={`/invoices?status=${total.status}`}
                className="group flex items-center gap-2 rounded-control text-ink"
                // El nombre accesible empieza con el texto visible ("5 pendientes") y suma el importe.
                aria-label={`${total.count} ${STATUS_NOUNS[total.status][total.count === 1 ? 0 : 1]}, ${formatMoney(total.total)}`}
              >
                <span aria-hidden="true" className="size-3 shrink-0 rounded-[3px]" style={{ background: STATUS_COLORS[total.status] }} />
                <span aria-hidden="true" className="group-hover:underline">
                  <span className="font-semibold tabular-nums">{total.count}</span>{' '}
                  {STATUS_NOUNS[total.status][total.count === 1 ? 0 : 1]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}
