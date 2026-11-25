import { z } from 'zod'
import { pagedSchema, pageParam, sizeParam, sortParam } from './common.ts'

export const invoiceStatusSchema = z.enum(['PENDING', 'PAID', 'CANCELLED'])

export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>

// Nombre del estado en la interfaz (minúscula de oración, como los roles).
export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
  CANCELLED: 'Anulada',
}

export const INVOICE_STATUSES = invoiceStatusSchema.options

// InvoiceItemDto del backend. Los montos (BigDecimal) llegan como números JSON: 60000.00 → 60000.
export const invoiceItemSchema = z.object({
  lineNumber: z.number().int().positive(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  lineTotal: z.number(),
})

// InvoiceDto del backend. issueDate / dueDate son LocalDate ("2026-11-20"); dueDate y notes pueden ser
// null. Número, cliente, importes y auditoría los asigna el backend.
export const invoiceSchema = z.object({
  id: z.number().int().positive(),
  invoiceNumber: z.string(),
  customerId: z.number().int().positive(),
  customerName: z.string(),
  issueDate: z.iso.date(),
  dueDate: z.iso.date().nullable(),
  status: invoiceStatusSchema,
  notes: z.string().nullable(),
  items: z.array(invoiceItemSchema),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  createdAt: z.iso.datetime({ local: true }),
  updatedAt: z.iso.datetime({ local: true }).nullable(),
})

export const invoicePageSchema = pagedSchema(invoiceSchema)

export type InvoiceItem = z.infer<typeof invoiceItemSchema>
export type Invoice = z.infer<typeof invoiceSchema>

// Campos por los que la API permite ordenar facturas (InvoiceServiceImpl.SORT_FIELDS).
export const INVOICE_SORT_FIELDS = ['id', 'invoiceNumber', 'issueDate', 'dueDate', 'status', 'total', 'createdAt'] as const

export type InvoiceSortField = (typeof INVOICE_SORT_FIELDS)[number]

// Filtros del listado en la URL (?search=fac&status=PAID&customerId=3&page=2...). Como en clientes,
// cada campo cae a su valor por defecto si es inválido. Orden por defecto: el del backend, las más
// recientes primero.
export const invoiceFiltersSchema = z.object({
  search: z.string().trim().catch(''),
  customerId: z.coerce.number().int().positive().optional().catch(undefined),
  status: invoiceStatusSchema.optional().catch(undefined),
  issuedFrom: z.iso.date().optional().catch(undefined),
  issuedTo: z.iso.date().optional().catch(undefined),
  page: pageParam,
  size: sizeParam,
  sort: sortParam(INVOICE_SORT_FIELDS, 'issueDate,desc'),
})

export type InvoiceFilters = z.infer<typeof invoiceFiltersSchema>

// --- Formulario de alta y edición ---

// Hasta 2 decimales (las columnas son numeric(…, 2)). Se compara en centésimos para no depender
// de la representación binaria de los decimales (0.1 + 0.2).
const hasTwoDecimals = (value: number) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6

// Una línea. Cantidad y precio son números (inputs con valueAsNumber): un campo vacío llega como
// NaN y cae en el mensaje de obligatorio. Mismos límites que el InvoiceItemDto.
export const invoiceItemFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, 'La descripción es obligatoria')
    .max(255, 'La descripción no puede superar los 255 caracteres'),
  quantity: z
    .number({ error: 'La cantidad es obligatoria' })
    .gt(0, 'La cantidad debe ser mayor que 0')
    .lt(100_000_000, 'La cantidad admite hasta 8 enteros y 2 decimales')
    .refine(hasTwoDecimals, 'La cantidad admite hasta 8 enteros y 2 decimales'),
  unitPrice: z
    .number({ error: 'El precio unitario es obligatorio' })
    .min(0, 'El precio unitario no puede ser negativo')
    .lt(10_000_000_000, 'El precio unitario admite hasta 10 enteros y 2 decimales')
    .refine(hasTwoDecimals, 'El precio unitario admite hasta 10 enteros y 2 decimales'),
})

const isoDate = z.iso.date()

// El cliente es parte del formulario (spec 11): se elige con el autocompletado en el alta desde el
// listado, o llega fijo desde la ficha del cliente (alta) o desde la factura (edición). 0 = sin elegir.
// El backend valida igual; sus 400 por campo (también items[n].campo) se muestran con applyServerErrors.
export const invoiceFormSchema = z
  .object({
    customerId: z.number({ error: 'Elige un cliente' }).int().positive('Elige un cliente'),
    issueDate: z.string().min(1, 'La fecha de emisión es obligatoria').pipe(z.iso.date('Ingresa una fecha válida')),
    // '' = sin vencimiento.
    dueDate: z.union([z.literal(''), z.iso.date('Ingresa una fecha válida')]),
    status: invoiceStatusSchema,
    notes: z.string().trim().max(255, 'Las notas no pueden superar los 255 caracteres'),
    items: z
      .array(invoiceItemFormSchema)
      .min(1, 'La factura debe tener al menos una línea')
      .max(100, 'La factura no puede tener más de 100 líneas'),
  })
  .refine((values) => values.dueDate === '' || values.dueDate >= values.issueDate, {
    path: ['dueDate'],
    message: 'La fecha de vencimiento no puede ser anterior a la de emisión',
    // Por defecto Zod no corre este refine si otro campo (p. ej. una línea) tiene errores; así el
    // error de fechas se ve junto con los demás, siempre que las dos fechas sean válidas.
    when: ({ value }) => {
      const { issueDate, dueDate } = value as { issueDate?: unknown; dueDate?: unknown }
      return isoDate.safeParse(issueDate).success && isoDate.safeParse(dueDate).success
    },
  })

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>
export type InvoiceItemFormValues = z.infer<typeof invoiceItemFormSchema>

// Campos que pueden recibir errores 400 del backend ('items' cubre items.0.description, etc.).
export const INVOICE_FORM_FIELDS = ['customerId', 'issueDate', 'dueDate', 'status', 'notes', 'items'] as const

export const EMPTY_INVOICE_ITEM: InvoiceItemFormValues = { description: '', quantity: 1, unitPrice: 0 }

// --- Importes (vista previa; el backend calcula los definitivos con la misma fórmula) ---

/** IVA aplicado sobre el subtotal (InvoiceServiceImpl.TAX_RATE). */
export const TAX_RATE = 0.19

export type InvoiceTotals = { subtotal: number; tax: number; total: number }

// Centésimos enteros: cantidad y precio tienen 2 decimales, así las cuentas son exactas.
const toCents = (value: number) => (Number.isFinite(value) ? Math.round(value * 100) : 0)

/** Total de una línea: cantidad × precio redondeado a 2 decimales (medio hacia arriba, como el backend). */
export function lineTotal(quantity: number, unitPrice: number): number {
  return Math.round((toCents(quantity) * toCents(unitPrice)) / 100) / 100
}

/** Subtotal, IVA 19 % y total de unas líneas. Los campos vacíos (NaN) cuentan como 0. */
export function invoiceTotals(items: readonly { quantity: number; unitPrice: number }[]): InvoiceTotals {
  const subtotalCents = items.reduce((sum, item) => sum + toCents(lineTotal(item.quantity, item.unitPrice)), 0)
  // × 19 / 100 con enteros (no × 0.19): así un medio centavo exacto (9,5) no se convierte en 9,4999….
  const taxCents = Math.round((subtotalCents * Math.round(TAX_RATE * 100)) / 100)
  return { subtotal: subtotalCents / 100, tax: taxCents / 100, total: (subtotalCents + taxCents) / 100 }
}

/** Valores iniciales del formulario de edición a partir de la factura guardada. */
export function invoiceToFormValues(invoice: Invoice): InvoiceFormValues {
  return {
    customerId: invoice.customerId,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate ?? '',
    status: invoice.status,
    notes: invoice.notes ?? '',
    items: invoice.items.map(({ description, quantity, unitPrice }) => ({ description, quantity, unitPrice })),
  }
}
