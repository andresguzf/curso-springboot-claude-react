import { useDebouncedText } from '../../hooks/useDebouncedText.ts'
import type { CustomerFilters as Filters } from '../../schemas/customer.ts'
import { DateRangeField } from '../filters/DateRangeField.tsx'
import { FormField } from '../ui/FormField.tsx'
import { Input } from '../ui/Input.tsx'
import { Select } from '../ui/Select.tsx'

type CustomerFiltersProps = {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
}

// Campos del sidebar de clientes. Presentacional: recibe los filtros aplicados (de la URL) y
// avisa cada cambio al padre, que los guarda con useCustomerFilters.
export function CustomerFilters({ filters, onChange }: CustomerFiltersProps) {
  const city = useDebouncedText(filters.city, (text) => onChange({ city: text }))

  return (
    <>
      <FormField label="Estado">
        {(field) => (
          <Select
            {...field}
            value={filters.active ?? ''}
            onChange={(event) => {
              const value = event.target.value
              onChange({ active: value === 'true' || value === 'false' ? value : undefined })
            }}
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </Select>
        )}
      </FormField>

      <FormField label="Ciudad">
        {(field) => (
          <Input {...field} value={city.text} onChange={(event) => city.onChange(event.target.value)} placeholder="Santiago" />
        )}
      </FormField>

      <DateRangeField
        label="Fecha de nacimiento"
        from={filters.birthFrom}
        to={filters.birthTo}
        onChange={({ from, to }) => onChange({ birthFrom: from, birthTo: to })}
      />

      <DateRangeField
        label="Fecha de alta"
        from={filters.createdFrom}
        to={filters.createdTo}
        onChange={({ from, to }) => onChange({ createdFrom: from, createdTo: to })}
      />
    </>
  )
}
