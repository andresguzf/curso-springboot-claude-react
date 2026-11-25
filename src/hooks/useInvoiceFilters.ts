import { invoiceFiltersSchema, type InvoiceFilters } from '../schemas/invoice.ts'
import { useUrlFilters, type UrlFiltersConfig } from './useUrlFilters.ts'

const INVOICE_FILTERS: UrlFiltersConfig<InvoiceFilters> = {
  textFields: ['search'],
  cleared: { search: '', customerId: undefined, status: undefined, issuedFrom: undefined, issuedTo: undefined },
  // El rango de emisión cuenta como un filtro; el cliente (llega desde su ficha) también.
  countActive: (filters) =>
    [
      filters.customerId !== undefined,
      filters.status !== undefined,
      filters.issuedFrom !== undefined || filters.issuedTo !== undefined,
    ].filter(Boolean).length,
}

// Filtros del listado de facturas en la URL (ver useUrlFilters).
export function useInvoiceFilters() {
  return useUrlFilters(invoiceFiltersSchema, INVOICE_FILTERS)
}
