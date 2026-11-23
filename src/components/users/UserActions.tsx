import { ShieldCheck, ShieldMinus, Trash2, UserCheck, UserX } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import type { UserAction } from '../../hooks/useUserActions.ts'
import { deleteRule, roleChangeRule, statusChangeRule } from '../../lib/userRules.ts'
import type { User } from '../../schemas/user.ts'
import { IconButton } from '../ui/IconButton.tsx'

type UserActionsProps = {
  user: User
  me: User | null
  /** Administradores habilitados (para la regla del último admin). */
  activeAdmins?: number
  onAction: (action: UserAction, user: User) => void
  busy?: boolean
  /** Icono que va primero en la misma fila (en la tabla, Editar). */
  leading?: ReactNode
}

// Cambiar rol, habilitar / deshabilitar y eliminar, como iconos. Si una regla de administradores lo
// impide, el icono queda deshabilitado y el motivo se muestra debajo, asociado con aria-describedby
// (visible y accesible). Quien decide al final es el backend.
export function UserActions({ user, me, activeAdmins, onAction, busy = false, leading }: UserActionsProps) {
  const reasonId = useId()
  const role = roleChangeRule(user, me, activeAdmins)
  const status = statusChangeRule(user, me, activeAdmins)
  const remove = deleteRule(user, me, activeAdmins)
  // Las tres reglas comparten motivo (uno mismo o el último admin): se muestra una sola vez.
  const reason = [role, status, remove].find((rule) => !rule.allowed)
  const describedBy = (allowed: boolean) => (allowed ? undefined : reasonId)
  const isAdmin = user.role === 'ADMIN'

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center justify-end gap-1">
        {leading}
        <IconButton
          label={isAdmin ? `Cambiar a Usuario a ${user.email}` : `Cambiar a Administrador a ${user.email}`}
          icon={isAdmin ? ShieldMinus : ShieldCheck}
          disabled={busy || !role.allowed}
          aria-describedby={describedBy(role.allowed)}
          onClick={() => onAction(isAdmin ? 'demote' : 'promote', user)}
        />
        <IconButton
          label={user.enabled ? `Deshabilitar a ${user.email}` : `Habilitar a ${user.email}`}
          icon={user.enabled ? UserX : UserCheck}
          disabled={busy || !status.allowed}
          aria-describedby={describedBy(status.allowed)}
          onClick={() => onAction(user.enabled ? 'disable' : 'enable', user)}
        />
        <IconButton
          label={`Eliminar a ${user.email}`}
          icon={Trash2}
          tone="danger"
          disabled={busy || !remove.allowed}
          aria-describedby={describedBy(remove.allowed)}
          onClick={() => onAction('delete', user)}
        />
      </div>
      {reason && !reason.allowed && (
        <p id={reasonId} className="max-w-36 text-right text-[0.8125rem] leading-snug whitespace-normal text-ink-muted">
          {reason.reason}
        </p>
      )}
    </div>
  )
}
