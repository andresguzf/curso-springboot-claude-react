import { http } from '../lib/http.ts'
import { toQuery } from '../lib/query.ts'
import { customerPageSchema, customerSchema, type CustomerFilters } from '../schemas/customer.ts'

// Endpoints de /api/customers. La escritura (create / update / remove) y la exportación
// se agregan en D-06 a D-08.
export const customerService = {
  // Listado paginado. La URL del frontend cuenta las páginas desde 1 y la API desde 0:
  // la conversión vive solo aquí. toQuery omite los filtros vacíos.
  page: ({ page, ...filters }: CustomerFilters) =>
    http.get(`/api/customers${toQuery({ ...filters, page: page - 1 })}`, customerPageSchema),

  get: (id: number) => http.get(`/api/customers/${id}`, customerSchema),
}
