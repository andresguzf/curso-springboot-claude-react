import { customerFiltersSchema, type CustomerFilters } from '../schemas/customer.ts'
import { useUrlFilters, type UrlFiltersConfig } from './useUrlFilters.ts'

const CUSTOMER_FILTERS: UrlFiltersConfig<CustomerFilters> = {
  textFields: ['search', 'city'],
  cleared: {
    search: '',
    active: undefined,
    city: '',
    birthFrom: undefined,
    birthTo: undefined,
    createdFrom: undefined,
    createdTo: undefined,
  },
  // Cada rango de fechas cuenta como un filtro.
  countActive: (filters) =>
    [
      filters.active !== undefined,
      filters.city !== '',
      filters.birthFrom !== undefined || filters.birthTo !== undefined,
      filters.createdFrom !== undefined || filters.createdTo !== undefined,
    ].filter(Boolean).length,
}

// Filtros del listado de clientes en la URL (ver useUrlFilters).
export function useCustomerFilters() {
  return useUrlFilters(customerFiltersSchema, CUSTOMER_FILTERS)
}
