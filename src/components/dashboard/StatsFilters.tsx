import { X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { useCustomer } from '../../hooks/useCustomers.ts'
import { todayIsoDate } from '../../lib/dates.ts'
import { activePreset, STATS_PRESETS } from '../../lib/statsRanges.ts'
import type { StatsFilters as Filters } from '../../schemas/invoice.ts'
import { DateRangeField } from '../filters/DateRangeField.tsx'
import { CustomerCombobox } from '../invoices/CustomerCombobox.tsx'
import { Button } from '../ui/Button.tsx'
import { FormField } from '../ui/FormField.tsx'
import { IconButton } from '../ui/IconButton.tsx'

type StatsFiltersProps = {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
  onClear: () => void
  hasFilters: boolean
  /** Cambia en cada «Limpiar filtros»: remonta los campos para descartar lo que se estaba escribiendo. */
  resetKey: number
}

// Barra de filtros de la sección «Facturación» (spec 12): cliente (autocompletado; elegido, un chip
// con × como en el listado de facturas), rango de emisión y atajos de rango. Presentacional: los
// filtros viven en la URL (useStatsFilters) y cada cambio se avisa al padre.
export function StatsFilters({ filters, onChange, onClear, hasFilters, resetKey }: StatsFiltersProps) {
  // Nombre del cliente filtrado para el chip; sin filtro la consulta no corre (id 0).
  const customer = useCustomer(filters.customerId ?? 0)
  const customerLabel = customer.data ? `${customer.data.name} ${customer.data.lastName}` : `#${filters.customerId}`
  // "Hoy" para marcar el atajo activo, leído una sola vez (no en cada render: new Date() no es puro).
  const [today] = useState(todayIsoDate)
  const active = activePreset(filters, today)

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,18rem)_1fr] lg:items-end">
      <div>
        {filters.customerId !== undefined ? (
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-ink">Cliente</p>
            <p className="inline-flex max-w-full items-center gap-1 rounded-control border border-line bg-canvas py-0.5 pr-0.5 pl-3 text-sm text-ink">
              <Link
                to={`/customers/${filters.customerId}`}
                className="truncate font-medium underline-offset-2 hover:underline"
              >
                {customerLabel}
              </Link>
              <IconButton
                label={`Quitar el filtro por el cliente ${customerLabel}`}
                icon={X}
                onClick={() => onChange({ customerId: undefined })}
              />
            </p>
          </div>
        ) : (
          <FormField label="Cliente">
            {(field) => (
              <CustomerCombobox
                key={resetKey}
                field={field}
                onSelect={(selected) => {
                  if (selected) onChange({ customerId: selected.id })
                }}
              />
            )}
          </FormField>
        )}
      </div>

      <DateRangeField
        key={resetKey}
        label="Emisión"
        from={filters.issuedFrom}
        to={filters.issuedTo}
        onChange={({ from, to }) => onChange({ issuedFrom: from, issuedTo: to })}
      />

      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Rangos rápidos" className="flex flex-wrap gap-2">
          {STATS_PRESETS.map((preset) => (
            <Button
              key={preset.key}
              size="sm"
              aria-pressed={active === preset.key}
              // El estilo del activo sale de aria-pressed (variante de Tailwind, que gana a la de la base).
              className="aria-pressed:border-accent aria-pressed:bg-accent-soft aria-pressed:font-semibold"
              // Fija "desde" y limpia "hasta" (los atajos no lo usan); "hoy" se lee en el clic.
              onClick={() => onChange({ issuedFrom: undefined, issuedTo: undefined, ...preset.range(todayIsoDate()) })}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        {hasFilters && (
          <Button size="sm" variant="ghost" onClick={onClear}>
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  )
}
