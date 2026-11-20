import { z } from 'zod'

// Metadatos de una página del backend (Spring Data PagedModel). `number` empieza en 0.
export const pageMetaSchema = z.object({
  size: z.number().int(),
  number: z.number().int(),
  totalElements: z.number().int(),
  totalPages: z.number().int(),
})

export type PageMeta = z.infer<typeof pageMetaSchema>

// Respuesta paginada de la API: { content: [...], page: { size, number, totalElements, totalPages } }.
// Se arma a partir del esquema de cada elemento: pagedSchema(customerSchema).
export function pagedSchema<T extends z.ZodType>(item: T) {
  return z.object({
    content: z.array(item),
    page: pageMetaSchema,
  })
}

export type Paged<T> = {
  content: T[]
  page: PageMeta
}

// Error de la API en formato ProblemDetail (RFC 9457). La validación agrega `errors` (campo → mensaje).
export const problemDetailSchema = z.object({
  type: z.string().optional(),
  title: z.string().optional(),
  status: z.number().int().optional(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  errors: z.record(z.string(), z.string()).optional(),
})

export type ProblemDetail = z.infer<typeof problemDetailSchema>
