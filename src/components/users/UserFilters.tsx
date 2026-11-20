import { ROLE_LABELS, type UserFilters as Filters } from '../../schemas/user.ts'
import { FormField } from '../ui/FormField.tsx'
import { Select } from '../ui/Select.tsx'

type UserFiltersProps = {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
}

// Campos del sidebar de usuarios (presentacional): rol y estado.
export function UserFilters({ filters, onChange }: UserFiltersProps) {
  return (
    <>
      <FormField label="Rol">
        {(field) => (
          <Select
            {...field}
            value={filters.role ?? ''}
            onChange={(event) => {
              const value = event.target.value
              onChange({ role: value === 'ADMIN' || value === 'USER' ? value : undefined })
            }}
          >
            <option value="">Todos</option>
            <option value="ADMIN">{ROLE_LABELS.ADMIN}</option>
            <option value="USER">{ROLE_LABELS.USER}</option>
          </Select>
        )}
      </FormField>

      <FormField label="Estado">
        {(field) => (
          <Select
            {...field}
            value={filters.enabled ?? ''}
            onChange={(event) => {
              const value = event.target.value
              onChange({ enabled: value === 'true' || value === 'false' ? value : undefined })
            }}
          >
            <option value="">Todos</option>
            <option value="true">Habilitados</option>
            <option value="false">Deshabilitados</option>
          </Select>
        )}
      </FormField>
    </>
  )
}
