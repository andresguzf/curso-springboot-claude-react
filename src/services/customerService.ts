import { http } from '../lib/http.ts'
import { toQuery } from '../lib/query.ts'
import {
  customerPageSchema,
  customerSchema,
  EXPORT_FORMATS,
  type CustomerFilters,
  type CustomerFormValues,
  type ExportFormat,
} from '../schemas/customer.ts'

// Endpoints de /api/customers.
export const customerService = {
  // Listado paginado. La URL del frontend cuenta las páginas desde 1 y la API desde 0:
  // la conversión vive solo aquí. toQuery omite los filtros vacíos.
  page: ({ page, ...filters }: CustomerFilters) =>
    http.get(`/api/customers${toQuery({ ...filters, page: page - 1 })}`, customerPageSchema),

  get: (id: number) => http.get(`/api/customers/${id}`, customerSchema),

  // Escritura (solo ADMIN). El backend responde el cliente guardado con sus fechas de auditoría.
  create: (values: CustomerFormValues) => http.post('/api/customers', values, customerSchema),

  update: (id: number, values: CustomerFormValues) => http.put(`/api/customers/${id}`, values, customerSchema),

  // 204 sin cuerpo.
  remove: (id: number) => http.delete(`/api/customers/${id}`),

  // Exporta TODO el resultado con los filtros y el orden actuales (sin page ni size: el backend
  // devuelve la lista completa en ese formato). Pasa por http.download, que renueva la sesión.
  exportFile: ({ page: _page, size: _size, ...filters }: CustomerFilters, format: ExportFormat) => {
    const { accept, extension } = EXPORT_FORMATS[format]
    return http.download(`/api/customers${toQuery({ ...filters, format })}`, accept, `clientes.${extension}`)
  },
}
