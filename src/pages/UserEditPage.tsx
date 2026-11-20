import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { Button } from '../components/ui/Button.tsx'
import { ConfirmDialog } from '../components/ui/ConfirmDialog.tsx'
import { EmptyState } from '../components/ui/EmptyState.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { Spinner } from '../components/ui/Spinner.tsx'
import { UserForm } from '../components/users/UserForm.tsx'
import { useListPath } from '../hooks/useListPath.ts'
import { useUpdateUser, useUser } from '../hooks/useUsers.ts'
import { errorMessage } from '../lib/errors.ts'
import { HttpError } from '../lib/http.ts'
import { applyServerErrors } from '../lib/serverErrors.ts'
import { USER_FORM_FIELDS, type User, type UserFormValues } from '../schemas/user.ts'
import { flash } from '../stores/flashStore.ts'

function toFormValues(user: User): UserFormValues {
  return { email: user.email, password: '', role: user.role, enabled: user.enabled }
}

// Envío que espera confirmación (degradar a un ADMIN).
type PendingSubmit = { values: UserFormValues; setError: UseFormSetError<UserFormValues> }

// Edición de usuario (ruta dentro de RequireRole ADMIN).
export function UserEditPage() {
  const params = useParams()
  const id = Number(params.id)
  const navigate = useNavigate()
  const { listPath } = useListPath('/users')
  const user = useUser(id)
  const update = useUpdateUser(id)
  const [pending, setPending] = useState<PendingSubmit | null>(null)

  function save({ values, setError }: PendingSubmit, { inDialog }: { inDialog: boolean }) {
    update.mutate(values, {
      onSuccess: () => navigate(listPath),
      onError: (error) => {
        const shown = applyServerErrors(error, setError, {
          fields: USER_FORM_FIELDS,
          conflict: { field: 'email', message: 'Ya existe un usuario con este email', title: 'Recurso duplicado' },
        })
        if (shown) setPending(null) // el error quedó bajo su campo: se cierra el modal para verlo
        else if (!inDialog) flash.error(errorMessage(error, 'No se pudieron guardar los cambios. Inténtalo de nuevo.'))
        // Con el modal abierto, el error (p. ej. un 409 de reglas de admin) se muestra dentro de él.
      },
    })
  }

  const isNotFound = !Number.isInteger(id) || id <= 0 || (user.error instanceof HttpError && user.error.status === 404)

  if (isNotFound) {
    return (
      <EmptyState
        title="Usuario no encontrado"
        description="Puede que se haya eliminado o que el enlace no sea correcto."
        action={
          <Link to={listPath} className="text-sm font-medium text-accent-strong underline underline-offset-2">
            Volver a usuarios
          </Link>
        }
      />
    )
  }

  if (user.isError) {
    return (
      <EmptyState
        title="No se pudo cargar el usuario"
        description={errorMessage(user.error, 'Inténtalo de nuevo en unos minutos.')}
        action={
          <Button onClick={() => user.refetch()} isPending={user.isFetching}>
            Reintentar
          </Button>
        }
      />
    )
  }

  if (user.isPending) {
    return (
      <div className="flex items-center justify-center gap-3 py-16 text-sm text-ink-muted">
        <Spinner className="size-5" /> Cargando usuario…
      </div>
    )
  }

  const data = user.data

  return (
    <>
      <PageHeader title={`Editar a ${data.email}`} />
      <div className="max-w-2xl">
        <UserForm
          key={data.id}
          mode="edit"
          defaultValues={toFormValues(data)}
          submitLabel="Guardar cambios"
          isPending={update.isPending && pending === null}
          cancelTo={listPath}
          onSubmit={(values, setError) => {
            // Degradar a un administrador pide confirmación: afecta el acceso de otra persona.
            if (data.role === 'ADMIN' && values.role === 'USER') {
              update.reset()
              setPending({ values, setError })
            } else {
              save({ values, setError }, { inDialog: false })
            }
          }}
        />
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={`¿Quitar el rol de administrador a «${data.email}»?`}
        description="Pasará a Usuario: no podrá administrar usuarios ni modificar clientes. Sus sesiones se cerrarán y el cambio se aplica en un máximo de 15 minutos."
        confirmLabel="Cambiar a Usuario"
        tone="danger"
        isPending={update.isPending}
        error={update.isError ? errorMessage(update.error, 'No se pudieron guardar los cambios.') : null}
        onConfirm={() => pending && save(pending, { inDialog: true })}
        onCancel={() => setPending(null)}
      />
    </>
  )
}
