import { INVOICE_STATUSES, invoiceStatusSchema, STATUS_LABELS, type InvoiceFilters as Filters } from '../../schemas/invoice.ts'
import { DateRangeField } from '../filters/DateRangeField.tsx'
import { FormField } from '../ui/FormField.tsx'
import { Select } from '../ui/Select.tsx'

type InvoiceFiltersProps = {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
}

// Campos del sidebar de facturas. Presentacional: recibe los filtros aplicados (de la URL) y avisa
// cada cambio al padre, que los guarda con useInvoiceFilters. El filtro por cliente llega desde su
// ficha y se quita con el chip de la página.
export function InvoiceFilters({ filters, onChange }: InvoiceFiltersProps) {
  return (
    <>
      <FormField label="Estado">
        {(field) => (
          <Select
            {...field}
            value={filters.status ?? ''}
            onChange={(event) => {
              const parsed = invoiceStatusSchema.safeParse(event.target.value)
              onChange({ status: parsed.success ? parsed.data : undefined })
            }}
          >
            <option value="">Todos</option>
            {INVOICE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        )}
      </FormField>

      <DateRangeField
        label="Fecha de emisión"
        from={filters.issuedFrom}
        to={filters.issuedTo}
        onChange={({ from, to }) => onChange({ issuedFrom: from, issuedTo: to })}
      />
    </>
  )
}
