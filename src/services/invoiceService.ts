import { http } from '../lib/http.ts'
import { toQuery } from '../lib/query.ts'
import {
  invoicePageSchema,
  invoiceSchema,
  invoiceStatsSchema,
  type InvoiceFilters,
  type InvoiceFormValues,
  type StatsFilters,
} from '../schemas/invoice.ts'

// Cuerpo del POST / PUT: los valores del formulario (con el cliente). Vencimiento vacío → null. El
// número, los totales de cada línea y los importes no se envían: los calcula el backend.
function toBody(values: InvoiceFormValues) {
  return { ...values, dueDate: values.dueDate === '' ? null : values.dueDate }
}

// Endpoints de /api/invoices.
export const invoiceService = {
  // Listado paginado. La URL del frontend cuenta las páginas desde 1 y la API desde 0:
  // la conversión vive solo aquí. toQuery omite los filtros vacíos.
  page: ({ page, ...filters }: InvoiceFilters) =>
    http.get(`/api/invoices${toQuery({ ...filters, page: page - 1 })}`, invoicePageSchema),

  get: (id: number) => http.get(`/api/invoices/${id}`, invoiceSchema),

  // Estadísticas del resumen: totales, por estado, por mes y los 5 clientes con más facturado, con los
  // filtros opcionales de cliente y rango de emisión (spec 12). toQuery omite los vacíos.
  stats: (filters: StatsFilters) => http.get(`/api/invoices/stats${toQuery(filters)}`, invoiceStatsSchema),

  // Escritura (solo ADMIN). El backend responde la factura con su número, líneas e importes.
  create: (values: InvoiceFormValues) => http.post('/api/invoices', toBody(values), invoiceSchema),

  update: (id: number, values: InvoiceFormValues) => http.put(`/api/invoices/${id}`, toBody(values), invoiceSchema),

  // 204 sin cuerpo; también borra sus líneas.
  remove: (id: number) => http.delete(`/api/invoices/${id}`),
}
