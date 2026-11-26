import { useNavigate } from 'react-router'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useMediaQuery } from '../../hooks/useMediaQuery.ts'
import { formatCompactMoney, formatMoney, formatMonthLong, formatMonthShort, monthRange } from '../../lib/format.ts'
import { invoicesListPath } from '../../lib/statsRanges.ts'
import type { InvoiceStats, StatsFilters } from '../../schemas/invoice.ts'

type Month = InvoiceStats['monthly'][number]

// Colores por variable CSS: cambian solos con el tema (data-theme), sin leer el tema en JavaScript.
const PAID = 'var(--color-success)'
const PENDING = 'var(--color-warning)'

type MonthTickProps = { x?: number; y?: number; payload?: { value: string }; current?: string }

// Etiqueta del eje: el mes abreviado. El mes actual lleva la marca del acento (como la pestaña activa).
function MonthTick({ x = 0, y = 0, payload, current }: MonthTickProps) {
  const month = payload?.value ?? ''
  const isCurrent = month === current
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        dy={14}
        textAnchor="middle"
        fontSize={12}
        fill={isCurrent ? 'var(--color-accent-strong)' : 'var(--color-ink-muted)'}
        fontWeight={isCurrent ? 600 : 400}
      >
        {formatMonthShort(month)}
      </text>
      {isCurrent && <rect x={-12} y={20} width={24} height={2} rx={1} fill="var(--color-accent)" />}
    </g>
  )
}

type MonthTooltipProps = { active?: boolean; payload?: ReadonlyArray<{ payload?: Month }> }

function MonthTooltip({ active, payload }: MonthTooltipProps) {
  const month = payload?.[0]?.payload
  if (!active || !month) return null
  return (
    <div className="rounded-control border border-line bg-surface px-3 py-2 text-sm text-ink shadow-popover">
      <p className="font-semibold first-letter:uppercase">{formatMonthLong(month.month)}</p>
      <p className="tabular-nums">
        <span className="text-ink-muted">Pagado </span>
        {formatMoney(month.paid)}
      </p>
      <p className="tabular-nums">
        <span className="text-ink-muted">Pendiente </span>
        {formatMoney(month.pending)}
      </p>
    </div>
  )
}

// Título del gráfico: sin rango, "últimos N meses"; con rango, de qué mes a qué mes.
function monthCaption(months: InvoiceStats['monthly'], hasRange: boolean): string {
  if (!hasRange) return `Por mes, últimos ${months.length} meses`
  const first = months.at(0)?.month
  const last = months.at(-1)?.month
  if (!first || !last) return 'Por mes'
  return first === last ? `Por mes, ${formatMonthLong(first)}` : `Por mes, de ${formatMonthLong(first)} a ${formatMonthLong(last)}`
}

type MonthlyChartProps = {
  monthly: InvoiceStats['monthly']
  /** Filtros del resumen: el clic en una barra abre ese mes (acotado al rango) con el mismo cliente. */
  filters: StatsFilters
}

// Facturación por mes de emisión (K-07): barras apiladas, pagado abajo y pendiente arriba. En pantallas
// chicas, los 6 meses más recientes (12 barras quedarían de pocos píxeles). Un clic en una barra abre
// el listado de facturas de ese mes; la misma información va en una tabla para lectores de pantalla.
export function MonthlyChart({ monthly, filters }: MonthlyChartProps) {
  const navigate = useNavigate()
  const isWide = useMediaQuery('(min-width: 40rem)')
  const hasRange = filters.issuedFrom !== undefined || filters.issuedTo !== undefined
  // En móvil, sin rango, los 6 meses más recientes; con un rango elegido, todos los del rango.
  const months = isWide || hasRange ? monthly : monthly.slice(-6)
  const current = monthly.at(-1)?.month
  const caption = monthCaption(months, hasRange)

  // El mes de la barra, acotado al rango del filtro (las fechas yyyy-MM-dd se comparan como texto).
  function openMonth(month: string) {
    const range = monthRange(month)
    const from = filters.issuedFrom && filters.issuedFrom > range.from ? filters.issuedFrom : range.from
    const to = filters.issuedTo && filters.issuedTo < range.to ? filters.issuedTo : range.to
    navigate(invoicesListPath(filters, { issuedFrom: from, issuedTo: to }))
  }

  return (
    <figure className="min-w-0">
      <figcaption className="mb-2 text-sm font-semibold text-ink">{caption}</figcaption>
      <div aria-hidden="true" className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          {/* accessibilityLayer={false}: sin él Recharts hace enfocable el SVG, que está dentro de un
              contenedor aria-hidden; la alternativa accesible es la tabla de abajo. */}
          <BarChart
            data={months}
            margin={{ top: 4, right: 4, bottom: 8, left: 0 }}
            barCategoryGap="25%"
            accessibilityLayer={false}
          >
            <CartesianGrid vertical={false} stroke="var(--color-line)" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: 'var(--color-line-strong)' }}
              interval={0}
              tick={<MonthTick current={current} />}
            />
            <YAxis
              tickFormatter={formatCompactMoney}
              tickLine={false}
              axisLine={false}
              width={64}
              tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }}
            />
            <Tooltip content={<MonthTooltip />} cursor={{ fill: 'var(--color-canvas)' }} isAnimationActive={false} />
            <Bar
              dataKey="paid"
              name="Pagado"
              stackId="month"
              fill={PAID}
              isAnimationActive={false}
              cursor="pointer"
              onClick={(_, index) => openMonth(months[index].month)}
            />
            <Bar
              dataKey="pending"
              name="Pendiente"
              stackId="month"
              fill={PENDING}
              radius={[3, 3, 0, 0]}
              isAnimationActive={false}
              cursor="pointer"
              onClick={(_, index) => openMonth(months[index].month)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Facturación por mes de emisión</caption>
        <thead>
          <tr>
            <th scope="col">Mes</th>
            <th scope="col">Pagado</th>
            <th scope="col">Pendiente</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month) => (
            <tr key={month.month}>
              <th scope="row">{formatMonthLong(month.month)}</th>
              <td>{formatMoney(month.paid)}</td>
              <td>{formatMoney(month.pending)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
