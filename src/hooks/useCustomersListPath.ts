import { useListPath } from './useListPath.ts'

// Volver al listado de clientes con sus filtros (ver useListPath).
export function useCustomersListPath() {
  return useListPath('/customers')
}
