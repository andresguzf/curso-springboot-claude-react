import { z } from 'zod'
import { pagedSchema } from './common.ts'

// CustomerDto del backend. birthDate es LocalDate ("1990-05-20"); createdAt / updatedAt son
// LocalDateTime sin zona ("2026-11-19T10:15:30.123") y updatedAt es null si nunca se editó.
export const customerSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  birthDate: z.iso.date(),
  active: z.boolean(),
  createdAt: z.iso.datetime({ local: true }),
  updatedAt: z.iso.datetime({ local: true }).nullable(),
})

export const customerPageSchema = pagedSchema(customerSchema)

export type Customer = z.infer<typeof customerSchema>

// Campos por los que la API permite ordenar (lista blanca de Pageables en el backend).
export const CUSTOMER_SORT_FIELDS = [
  'id',
  'name',
  'lastName',
  'email',
  'city',
  'birthDate',
  'active',
  'createdAt',
  'updatedAt',
] as const

export type CustomerSortField = (typeof CUSTOMER_SORT_FIELDS)[number]

export const PAGE_SIZES = [10, 25, 50] as const

const SORT_PATTERN = new RegExp(`^(${CUSTOMER_SORT_FIELDS.join('|')}),(asc|desc)$`)

// Filtros del listado tal como viven en la URL (?search=ana&active=true&page=2...).
// Cada campo tiene .catch(): un parámetro ausente o inválido (escrito a mano, enlace viejo)
// cae a su valor por defecto en vez de romper la pantalla. `page` empieza en 1 (en la API, en 0).
export const customerFiltersSchema = z.object({
  search: z.string().trim().catch(''),
  active: z.enum(['true', 'false']).optional().catch(undefined),
  city: z.string().trim().catch(''),
  birthFrom: z.iso.date().optional().catch(undefined),
  birthTo: z.iso.date().optional().catch(undefined),
  createdFrom: z.iso.date().optional().catch(undefined),
  createdTo: z.iso.date().optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1),
  size: z.coerce
    .number()
    .refine((size) => PAGE_SIZES.some((allowed) => allowed === size))
    .catch(PAGE_SIZES[0]),
  sort: z.string().regex(SORT_PATTERN).catch('id,asc'),
})

export type CustomerFilters = z.infer<typeof customerFiltersSchema>
