import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { CustomerFilters } from '../schemas/customer.ts'
import { customerService } from '../services/customerService.ts'

// Claves del cache de clientes, centralizadas: las mutaciones (D-06, D-07) invalidan `all`
// y así se refrescan juntos el listado y los detalles.
export const customerKeys = {
  all: ['customers'] as const,
  list: (filters: CustomerFilters) => [...customerKeys.all, 'list', filters] as const,
  detail: (id: number) => [...customerKeys.all, 'detail', id] as const,
}

// Una página del listado. Con keepPreviousData, al cambiar de página u orden se siguen viendo
// los datos anteriores (isPlaceholderData = true) hasta que llegan los nuevos: sin parpadeo.
export function useCustomersPage(filters: CustomerFilters) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => customerService.page(filters),
    placeholderData: keepPreviousData,
  })
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerService.get(id),
    // Un id inválido en la URL (/customers/abc) no llega a la API.
    enabled: Number.isInteger(id) && id > 0,
  })
}
