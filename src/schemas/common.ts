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

// --- Parámetros de listados en la URL (compartidos por clientes y usuarios) ---

export const PAGE_SIZES = [10, 25, 50] as const

// Página desde 1 (en la API, desde 0: la conversión vive en cada servicio).
export const pageParam = z.coerce.number().int().min(1).catch(1)

export const sizeParam = z.coerce
  .number()
  .refine((size) => PAGE_SIZES.some((allowed) => allowed === size))
  .catch(PAGE_SIZES[0])

// "campo,asc" o "campo,desc", solo con campos de la lista blanca del backend (si no, 400).
export function sortParam(fields: readonly string[], fallback: string) {
  return z
    .string()
    .regex(new RegExp(`^(${fields.join('|')}),(asc|desc)$`))
    .catch(fallback)
}
