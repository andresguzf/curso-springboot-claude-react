import { userFiltersSchema, type UserFilters } from '../schemas/user.ts'
import { useUrlFilters, type UrlFiltersConfig } from './useUrlFilters.ts'

const USER_FILTERS: UrlFiltersConfig<UserFilters> = {
  textFields: ['search'],
  cleared: { search: '', role: undefined, enabled: undefined },
  countActive: (filters) => [filters.role !== undefined, filters.enabled !== undefined].filter(Boolean).length,
}

// Filtros del listado de usuarios en la URL (ver useUrlFilters).
export function useUserFilters() {
  return useUrlFilters(userFiltersSchema, USER_FILTERS)
}
