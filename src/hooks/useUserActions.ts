import { useState } from 'react'
import type { ComponentProps } from 'react'
import type { ConfirmDialog } from '../components/ui/ConfirmDialog.tsx'
import { errorMessage } from '../lib/errors.ts'
import type { User } from '../schemas/user.ts'
import { flash } from '../stores/flashStore.ts'
import { useChangeUser, useDeleteUser, type UserChange } from './useUsers.ts'

export type UserAction = 'promote' | 'demote' | 'enable' | 'disable' | 'delete'

// Acciones que esperan confirmación: eliminar, degradar a un ADMIN o deshabilitar a un ADMIN.
type PendingAction = { action: UserAction; user: User }

const CHANGES: Record<Exclude<UserAction, 'delete'>, UserChange> = {
  promote: { role: 'ADMIN' },
  demote: { role: 'USER' },
  enable: { enabled: true },
  disable: { enabled: false },
}

const SESSIONS_NOTICE = 'Se cerrarán sus sesiones; el cambio se aplica en máximo 15 minutos.'

function dialogTexts({ action, user }: PendingAction) {
  if (action === 'delete')
    return { title: `¿Eliminar a «${user.email}»?`, description: 'Esta acción no se puede deshacer.', confirmLabel: 'Eliminar' }
  if (action === 'demote')
    return { title: `¿Quitar el rol de administrador a «${user.email}»?`, description: `Pasará a Usuario. ${SESSIONS_NOTICE}`, confirmLabel: 'Cambiar a Usuario' }
  return { title: `¿Deshabilitar a «${user.email}»?`, description: `No podrá iniciar sesión. ${SESSIONS_NOTICE}`, confirmLabel: 'Deshabilitar' }
}

const needsConfirmation = (action: UserAction, user: User) =>
  action === 'delete' || action === 'demote' || (action === 'disable' && user.role === 'ADMIN')

// Ejecuta las acciones sobre usuarios (tabla y ficha). Las que afectan el acceso de un ADMIN o
// no se pueden deshacer piden confirmación; el error (p. ej. un 409 de reglas de admin) se ve
// dentro del modal o, si no hubo modal, en un flash. `onDeleted` decide qué hacer después de eliminar.
export function useUserActions({ onDeleted }: { onDeleted?: (user: User) => void } = {}) {
  const [pending, setPending] = useState<PendingAction | null>(null)
  const change = useChangeUser()
  const remove = useDeleteUser()

  function execute(action: UserAction, user: User, inDialog: boolean) {
    const options = {
      onSuccess: () => {
        setPending(null)
        if (action === 'delete') onDeleted?.(user)
      },
      onError: (error: Error) => {
        if (!inDialog) flash.error(errorMessage(error, 'No se pudo completar la acción. Inténtalo de nuevo.'))
      },
    }
    if (action === 'delete') remove.mutate(user, options)
    else change.mutate({ user, change: CHANGES[action] }, options)
  }

  function run(action: UserAction, user: User) {
    if (needsConfirmation(action, user)) {
      change.reset()
      remove.reset()
      setPending({ action, user })
    } else {
      execute(action, user, false)
    }
  }

  const activeMutation = pending?.action === 'delete' ? remove : change
  const texts = pending ? dialogTexts(pending) : { title: '', description: '', confirmLabel: 'Confirmar' }

  const dialogProps: ComponentProps<typeof ConfirmDialog> = {
    open: pending !== null,
    ...texts,
    tone: 'danger',
    isPending: activeMutation.isPending,
    error: activeMutation.isError ? errorMessage(activeMutation.error, 'No se pudo completar la acción.') : null,
    onConfirm: () => pending && execute(pending.action, pending.user, true),
    onCancel: () => setPending(null),
  }

  // Usuario con una acción en curso (para bloquear sus botones y evitar dobles clics).
  const busyUserId = change.isPending ? change.variables.user.id : remove.isPending ? remove.variables.id : undefined

  return { run, dialogProps, busyUserId }
}
