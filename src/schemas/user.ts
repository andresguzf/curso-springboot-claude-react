import { z } from 'zod'

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
