import type { ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { z } from 'zod'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { EmptyState } from '../components/ui/EmptyState.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { Spinner } from '../components/ui/Spinner.tsx'
import { useCustomer } from '../hooks/useCustomers.ts'
import { errorMessage } from '../lib/errors.ts'
import { formatDate, formatDateTime } from '../lib/format.ts'
import { HttpError } from '../lib/http.ts'

// La tabla deja en location.state el query string del listado; el state es `unknown`.
const listStateSchema = z.object({ listSearch: z.string() })

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 px-5 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="text-[0.9375rem] text-ink">{children}</dd>
    </div>
  )
}

export function CustomerDetailPage() {
  const params = useParams()
  const location = useLocation()
  const id = Number(params.id)
  const customer = useCustomer(id)

  const listState = listStateSchema.safeParse(location.state)
  const backTo = `/customers${listState.success ? listState.data.listSearch : ''}`
  const backLink = (
    <Link to={backTo} className="text-sm font-medium text-accent-strong underline underline-offset-2 hover:text-ink">
      Volver a clientes
    </Link>
  )

  const isNotFound = !Number.isInteger(id) || id <= 0 || (customer.error instanceof HttpError && customer.error.status === 404)

  if (isNotFound) {
    return (
      <EmptyState
        title="Cliente no encontrado"
        description="Puede que se haya eliminado o que el enlace no sea correcto."
        action={backLink}
      />
    )
  }

  if (customer.isError) {
    return (
      <EmptyState
        title="No se pudo cargar el cliente"
        description={errorMessage(customer.error, 'Inténtalo de nuevo en unos minutos.')}
        action={
          <Button onClick={() => customer.refetch()} isPending={customer.isFetching}>
            Reintentar
          </Button>
        }
      />
    )
  }

  if (customer.isPending) {
    return (
      <div className="flex items-center justify-center gap-3 py-16 text-sm text-ink-muted">
        <Spinner className="size-5" /> Cargando cliente…
      </div>
    )
  }

  const data = customer.data

  return (
    <>
      <PageHeader title={`${data.name} ${data.lastName}`} actions={backLink} />

      <dl className="divide-y divide-line rounded-panel border border-line bg-surface">
        <Field label="Email">{data.email}</Field>
        <Field label="Teléfono">
          <span className="tabular-nums">{data.phone}</span>
        </Field>
        <Field label="Dirección">{data.address}</Field>
        <Field label="Ciudad">{data.city}</Field>
        <Field label="Fecha de nacimiento">
          <span className="tabular-nums">{formatDate(data.birthDate)}</span>
        </Field>
        <Field label="Estado">{data.active ? <Badge tone="success">Activo</Badge> : <Badge>Inactivo</Badge>}</Field>
        <Field label="Alta">
          <span className="tabular-nums">{formatDateTime(data.createdAt)}</span>
        </Field>
        <Field label="Última modificación">
          {data.updatedAt ? <span className="tabular-nums">{formatDateTime(data.updatedAt)}</span> : 'Sin cambios'}
        </Field>
      </dl>
    </>
  )
}
