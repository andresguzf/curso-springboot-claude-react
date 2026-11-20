import { useId } from 'react'
import type { UserAction } from '../../hooks/useUserActions.ts'
import { deleteRule, roleChangeRule, statusChangeRule } from '../../lib/userRules.ts'
import type { User } from '../../schemas/user.ts'

type UserActionsProps = {
  user: User
  me: User | null
  /** Administradores habilitados (para la regla del último admin). */
  activeAdmins?: number
  onAction: (action: UserAction, user: User) => void
  busy?: boolean
}

const actionButton =
  'rounded-control text-sm font-medium whitespace-nowrap underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-ink-muted disabled:no-underline'

// Cambiar rol, habilitar / deshabilitar y eliminar. Si una regla de administradores lo impide,
// el botón queda deshabilitado y el motivo se muestra debajo, asociado con aria-describedby
// (visible y accesible, no solo un tooltip). Quien decide al final es el backend.
export function UserActions({ user, me, activeAdmins, onAction, busy = false }: UserActionsProps) {
  const reasonId = useId()
  const role = roleChangeRule(user, me, activeAdmins)
  const status = statusChangeRule(user, me, activeAdmins)
  const remove = deleteRule(user, me, activeAdmins)
  // Las tres reglas comparten motivo (uno mismo o el último admin): se muestra una sola vez.
  const reason = [role, status, remove].find((rule) => !rule.allowed)
  const describedBy = (allowed: boolean) => (allowed ? undefined : reasonId)

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          disabled={busy || !role.allowed}
          aria-describedby={describedBy(role.allowed)}
          onClick={() => onAction(user.role === 'ADMIN' ? 'demote' : 'promote', user)}
          className={`${actionButton} text-accent-strong`}
        >
          {user.role === 'ADMIN' ? 'Cambiar a Usuario' : 'Cambiar a Administrador'}
        </button>
        <button
          type="button"
          disabled={busy || !status.allowed}
          aria-describedby={describedBy(status.allowed)}
          onClick={() => onAction(user.enabled ? 'disable' : 'enable', user)}
          className={`${actionButton} text-accent-strong`}
        >
          {user.enabled ? 'Deshabilitar' : 'Habilitar'}
        </button>
        <button
          type="button"
          disabled={busy || !remove.allowed}
          aria-describedby={describedBy(remove.allowed)}
          aria-label={`Eliminar a ${user.email}`}
          onClick={() => onAction('delete', user)}
          className={`${actionButton} text-danger`}
        >
          Eliminar
        </button>
      </div>
      {reason && !reason.allowed && (
        <p id={reasonId} className="text-[0.8125rem] text-ink-muted">
          {reason.reason}
        </p>
      )}
    </div>
  )
}
