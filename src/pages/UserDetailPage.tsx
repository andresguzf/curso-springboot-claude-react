import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { buttonClassName } from '../components/ui/buttonStyles.ts'
import { ConfirmDialog } from '../components/ui/ConfirmDialog.tsx'
import { EmptyState } from '../components/ui/EmptyState.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { Spinner } from '../components/ui/Spinner.tsx'
import { RoleBadge } from '../components/users/RoleBadge.tsx'
import { UserActions } from '../components/users/UserActions.tsx'
import { useAuth } from '../hooks/useAuth.ts'
import { useListPath } from '../hooks/useListPath.ts'
import { useUserActions } from '../hooks/useUserActions.ts'
import { useActiveAdminCount, useUser } from '../hooks/useUsers.ts'
import { errorMessage } from '../lib/errors.ts'
import { formatDateTime } from '../lib/format.ts'
import { HttpError } from '../lib/http.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 px-5 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="text-[0.9375rem] text-ink">{children}</dd>
    </div>
  )
}

// Ficha de usuario (ruta dentro de RequireRole ADMIN), con editar y las mismas acciones que la tabla.
export function UserDetailPage() {
  const params = useParams()
  const id = Number(params.id)
  const user = useUser(id)
  useDocumentTitle(user.data?.email ?? 'Usuario')
  const { user: me } = useAuth()
  const { listPath, listState } = useListPath('/users')
  const navigate = useNavigate()
  const activeAdmins = useActiveAdminCount()
  // Tras eliminar, la ficha ya no existe: se vuelve al listado.
  const actions = useUserActions({ onDeleted: () => navigate(listPath) })
  const backLink = (
    <Link to={listPath} className="text-sm font-medium text-accent-strong underline underline-offset-2 hover:text-ink">
      Volver a usuarios
    </Link>
  )

  const isNotFound = !Number.isInteger(id) || id <= 0 || (user.error instanceof HttpError && user.error.status === 404)

  if (isNotFound) {
    return (
      <EmptyState
        titleAs="h1"
        title="Usuario no encontrado"
        description="Puede que se haya eliminado o que el enlace no sea correcto."
        action={backLink}
      />
    )
  }

  if (user.isError) {
    return (
      <EmptyState
        titleAs="h1"
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
      <PageHeader
        title={data.email}
        description={data.id === me?.id ? 'Este es tu usuario.' : undefined}
        actions={
          <>
            {backLink}
            <Link to={`/users/${data.id}/edit`} state={listState} className={buttonClassName({ variant: 'primary' })}>
              Editar
            </Link>
          </>
        }
      />

      <dl className="divide-y divide-line rounded-panel border border-line bg-surface">
        <Field label="Email">{data.email}</Field>
        <Field label="Rol">
          <RoleBadge role={data.role} />
        </Field>
        <Field label="Estado">
          {data.enabled ? <Badge tone="success">Habilitado</Badge> : <Badge>Deshabilitado</Badge>}
        </Field>
        <Field label="Alta">
          <span className="tabular-nums">{formatDateTime(data.createdAt)}</span>
        </Field>
        <Field label="Última modificación">
          {data.updatedAt ? <span className="tabular-nums">{formatDateTime(data.updatedAt)}</span> : 'Sin cambios'}
        </Field>
      </dl>

      <section aria-label="Acciones" className="mt-4 flex justify-end rounded-panel border border-line bg-surface px-5 py-4">
        <UserActions
          user={data}
          me={me}
          activeAdmins={activeAdmins.data}
          onAction={actions.run}
          busy={actions.busyUserId === data.id}
        />
      </section>

      <ConfirmDialog {...actions.dialogProps} />
    </>
  )
}
