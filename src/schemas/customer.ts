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

// Fecha de hoy en hora local (yyyy-MM-dd). Se llama al validar, no durante el render.
function todayIsoDate(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

// Formulario de alta y edición. Mismas reglas y mensajes que las validaciones del CustomerDto
// (obligatorios, máximos, email válido, fecha pasada): el usuario ve el error antes de enviar.
// El backend valida igual; sus errores (400 por campo, 409 de email) se muestran con applyServerErrors.
export const customerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(80, 'El nombre no puede superar los 80 caracteres'),
  lastName: z
    .string()
    .trim()
    .min(1, 'El apellido es obligatorio')
    .max(80, 'El apellido no puede superar los 80 caracteres'),
  email: z
    .string()
    .trim()
    .min(1, 'El email es obligatorio')
    .max(150, 'El email no puede superar los 150 caracteres')
    .pipe(z.email('El email no tiene un formato válido')),
  phone: z
    .string()
    .trim()
    .min(1, 'El teléfono es obligatorio')
    .max(30, 'El teléfono no puede superar los 30 caracteres'),
  address: z
    .string()
    .trim()
    .min(1, 'La dirección es obligatoria')
    .max(200, 'La dirección no puede superar los 200 caracteres'),
  city: z
    .string()
    .trim()
    .min(1, 'La ciudad es obligatoria')
    .max(80, 'La ciudad no puede superar los 80 caracteres'),
  birthDate: z
    .string()
    .min(1, 'La fecha de nacimiento es obligatoria')
    .pipe(z.iso.date('Ingresa una fecha válida'))
    .refine((date) => date < todayIsoDate(), 'La fecha de nacimiento debe ser una fecha pasada'),
  active: z.boolean(),
})

export type CustomerFormValues = z.infer<typeof customerFormSchema>

export const CUSTOMER_FORM_FIELDS = customerFormSchema.keyof().options

// Valores iniciales del alta: un cliente nuevo queda activo, como en el backend.
export const EMPTY_CUSTOMER_FORM: CustomerFormValues = {
  name: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  birthDate: '',
  active: true,
}

// Formatos de exportación del listado (content negotiation del backend con ?format=).
export const EXPORT_FORMATS = {
  csv: { label: 'CSV', accept: 'text/csv', extension: 'csv' },
  xlsx: { label: 'Excel', accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extension: 'xlsx' },
  pdf: { label: 'PDF', accept: 'application/pdf', extension: 'pdf' },
  xml: { label: 'XML', accept: 'application/xml', extension: 'xml' },
} as const

export type ExportFormat = keyof typeof EXPORT_FORMATS
