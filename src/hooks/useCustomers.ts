import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Customer, CustomerFilters, CustomerFormValues } from '../schemas/customer.ts'
import { customerService } from '../services/customerService.ts'
import { flash } from '../stores/flashStore.ts'

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

const fullName = (customer: Customer) => `${customer.name} ${customer.lastName}`

// Alta. En onSuccess se refresca todo lo cacheado de clientes y se publica el flash; la
// navegación la decide la página (callback de mutate), porque depende de dónde venía.
export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: CustomerFormValues) => customerService.create(values),
    onSuccess: async (customer) => {
      flash.success(`Cliente «${fullName(customer)}» creado`)
      await queryClient.invalidateQueries({ queryKey: customerKeys.all })
    },
  })
}

export function useUpdateCustomer(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: CustomerFormValues) => customerService.update(id, values),
    onSuccess: async (customer) => {
      flash.success(`Cliente «${fullName(customer)}» actualizado`)
      await queryClient.invalidateQueries({ queryKey: customerKeys.all })
    },
  })
}
