import type { User } from '../schemas/user.ts'

// Reglas de administradores que la UI anticipa (el backend las aplica igual y responde 409):
// nadie puede quitarse permisos a sí mismo y debe quedar al menos un ADMIN habilitado.
// Funciones puras: las usan la tabla y la ficha sin repetir condiciones.

export type Rule = { allowed: true } | { allowed: false; reason: string }

export const SELF_REASON = 'No puedes eliminar ni quitarte permisos a ti mismo'
export const LAST_ADMIN_REASON = 'Debe quedar al menos un administrador habilitado'

const ALLOWED: Rule = { allowed: true }

/**
 * Motivo por el que no se puede degradar, deshabilitar ni eliminar a `user`, o undefined.
 * `activeAdmins` undefined (conteo aún cargando): no se bloquea; si hiciera falta, decide el backend.
 */
function restriction(user: User, me: User | null, activeAdmins: number | undefined): string | undefined {
  if (user.id === me?.id) return SELF_REASON
  const isLastActiveAdmin = user.role === 'ADMIN' && user.enabled && activeAdmins !== undefined && activeAdmins <= 1
  return isLastActiveAdmin ? LAST_ADMIN_REASON : undefined
}

const toRule = (reason: string | undefined): Rule => (reason ? { allowed: false, reason } : ALLOWED)

// Promover a ADMIN siempre se puede; degradar, según las reglas.
export function roleChangeRule(user: User, me: User | null, activeAdmins?: number): Rule {
  return user.role === 'USER' ? ALLOWED : toRule(restriction(user, me, activeAdmins))
}

// Habilitar siempre se puede; deshabilitar, según las reglas.
export function statusChangeRule(user: User, me: User | null, activeAdmins?: number): Rule {
  return user.enabled ? toRule(restriction(user, me, activeAdmins)) : ALLOWED
}

export function deleteRule(user: User, me: User | null, activeAdmins?: number): Rule {
  return toRule(restriction(user, me, activeAdmins))
}
