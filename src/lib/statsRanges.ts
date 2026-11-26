import { toQuery } from './query.ts'

// Atajos de rango del resumen (spec 12). Funciones puras: reciben "hoy" (yyyy-MM-dd) y devuelven el
// rango de emisión; la página las llama en el handler del clic (no en el render), con todayIsoDate().
// Todos dejan "hasta" vacío: la API completa la serie hasta el mes actual.

export type StatsRange = { issuedFrom?: string; issuedTo?: string }

export type StatsPreset = {
  key: 'thisMonth' | 'last3Months' | 'thisYear' | 'last12Months'
  label: string
  range: (today: string) => StatsRange
}

// Primer día del mes que está `monthsBack` meses antes del de `today` ("2026-11-25", 2 → "2026-09-01").
function monthStart(today: string, monthsBack: number): string {
  const [year, month] = today.split('-').map(Number)
  const date = new Date(year, month - 1 - monthsBack, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}

export const STATS_PRESETS: readonly StatsPreset[] = [
  { key: 'thisMonth', label: 'Este mes', range: (today) => ({ issuedFrom: monthStart(today, 0) }) },
  { key: 'last3Months', label: 'Últimos 3 meses', range: (today) => ({ issuedFrom: monthStart(today, 2) }) },
  { key: 'thisYear', label: 'Este año', range: (today) => ({ issuedFrom: `${today.slice(0, 4)}-01-01` }) },
  // El resumen de siempre: sin rango (la API muestra los 12 meses hasta el actual).
  { key: 'last12Months', label: 'Últimos 12 meses', range: () => ({}) },
]

// El atajo que coincide con el rango aplicado, para marcarlo como activo; undefined si es un rango a mano.
export function activePreset(range: StatsRange, today: string): StatsPreset['key'] | undefined {
  return STATS_PRESETS.find((preset) => {
    const presetRange = preset.range(today)
    return presetRange.issuedFrom === range.issuedFrom && presetRange.issuedTo === range.issuedTo
  })?.key
}

// Enlace al listado de facturas con los filtros del resumen (cliente y rango de emisión) más los
// propios del enlace (estado, orden u otro cliente): "Pendiente" del resumen filtrado abre exactamente
// esas facturas.
export function invoicesListPath(
  filters: StatsRange & { customerId?: number },
  params: Record<string, string | number | undefined> = {},
): string {
  return `/invoices${toQuery({ ...filters, ...params })}`
}
