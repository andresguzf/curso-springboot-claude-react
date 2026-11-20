import { z } from 'zod'
import { pagedSchema, pageParam, sizeParam, sortParam } from './common.ts'

export const roleSchema = z.enum(['USER', 'ADMIN'])

// UserDto del backend: { id, email, role, enabled, createdAt, updatedAt }. El password nunca sale.
// Las fechas son LocalDateTime sin zona ("2026-11-19T10:15:30.123"); updatedAt es null si nunca se editó.
export const userSchema = z.object({
  id: z.number().int().positive(),
  email: z.string(),
  role: roleSchema,
  enabled: z.boolean(),
  createdAt: z.iso.datetime({ local: true }).nullish(),
  updatedAt: z.iso.datetime({ local: true }).nullish(),
})

export type Role = z.infer<typeof roleSchema>
export type User = z.infer<typeof userSchema>

// Nombre del rol en la interfaz (en minúscula de oración, ver specs/02-base-frontend/design.md).
export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrador',
  USER: 'Usuario',
}

export const userPageSchema = pagedSchema(userSchema)

// Campos por los que la API permite ordenar usuarios (lista blanca del backend).
export const USER_SORT_FIELDS = ['id', 'email', 'role', 'enabled', 'createdAt'] as const

// Filtros del listado de usuarios en la URL (?search=ana&role=ADMIN&enabled=true&page=2...).
// Igual que en clientes, cada campo cae a su valor por defecto si es inválido. El orden por
// defecto es el del backend: por email.
export const userFiltersSchema = z.object({
  search: z.string().trim().catch(''),
  role: roleSchema.optional().catch(undefined),
  enabled: z.enum(['true', 'false']).optional().catch(undefined),
  page: pageParam,
  size: sizeParam,
  sort: sortParam(USER_SORT_FIELDS, 'email,asc'),
})

export type UserFilters = z.infer<typeof userFiltersSchema>
