import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { InvoiceItemsTable } from '../components/invoices/InvoiceItemsTable.tsx'
import { InvoiceStatusBadge } from '../components/invoices/InvoiceStatusBadge.tsx'
import { InvoiceTotals } from '../components/invoices/InvoiceTotals.tsx'
import { Button } from '../components/ui/Button.tsx'
import { buttonClassName } from '../components/ui/buttonStyles.ts'
import { EmptyState } from '../components/ui/EmptyState.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { Spinner } from '../components/ui/Spinner.tsx'
import { useAuth } from '../hooks/useAuth.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { useInvoice } from '../hooks/useInvoices.ts'
import { useListPath } from '../hooks/useListPath.ts'
import { errorMessage } from '../lib/errors.ts'
import { formatDate, formatDateTime } from '../lib/format.ts'
import { HttpError } from '../lib/http.ts'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 px-5 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="text-[0.9375rem] text-ink">{children}</dd>
    </div>
  )
}

// Detalle de una factura (USER y ADMIN): cabecera, líneas e importes.
export function InvoiceDetailPage() {
  const params = useParams()
  const id = Number(params.id)
  const invoice = useInvoice(id)
  useDocumentTitle(invoice.data ? `Factura ${invoice.data.invoiceNumber}` : 'Factura')
  const { listPath, listState } = useListPath('/invoices')
  const { isAdmin } = useAuth()
  const backLink = (
    <Link to={listPath} className="text-sm font-medium text-accent-strong underline underline-offset-2 hover:text-ink">
      Volver a facturas
    </Link>
  )

  const isNotFound = !Number.isInteger(id) || id <= 0 || (invoice.error instanceof HttpError && invoice.error.status === 404)

  if (isNotFound) {
    return (
      <EmptyState
        titleAs="h1"
        title="Factura no encontrada"
        description="Puede que se haya eliminado o que el enlace no sea correcto."
        action={backLink}
      />
    )
  }

  if (invoice.isError) {
    return (
      <EmptyState
        titleAs="h1"
        title="No se pudo cargar la factura"
        description={errorMessage(invoice.error, 'Inténtalo de nuevo en unos minutos.')}
        action={
          <Button onClick={() => invoice.refetch()} isPending={invoice.isFetching}>
            Reintentar
          </Button>
        }
      />
    )
  }

  if (invoice.isPending) {
    return (
      <div className="flex items-center justify-center gap-3 py-16 text-sm text-ink-muted">
        <Spinner className="size-5" /> Cargando factura…
      </div>
    )
  }

  const data = invoice.data

  return (
    <>
      <PageHeader
        title={`Factura ${data.invoiceNumber}`}
        actions={
          <>
            {backLink}
            {isAdmin && (
              // Se reenvía el state: tras editar, "Volver a facturas" sigue llevando al listado con sus filtros.
              <Link to={`/invoices/${data.id}/edit`} state={listState} className={buttonClassName({ variant: 'primary' })}>
                Editar
              </Link>
            )}
          </>
        }
      />

      <div className="space-y-6">
        <dl className="divide-y divide-line rounded-panel border border-line bg-surface">
          <Field label="Cliente">
            <Link to={`/customers/${data.customerId}`} className="font-medium underline-offset-2 hover:underline">
              {data.customerName}
            </Link>
          </Field>
          <Field label="Estado">
            <InvoiceStatusBadge status={data.status} />
          </Field>
          <Field label="Emisión">
            <span className="tabular-nums">{formatDate(data.issueDate)}</span>
          </Field>
          <Field label="Vencimiento">
            {data.dueDate ? <span className="tabular-nums">{formatDate(data.dueDate)}</span> : 'Sin vencimiento'}
          </Field>
          <Field label="Notas">{data.notes ?? 'Sin notas'}</Field>
          <Field label="Alta">
            <span className="tabular-nums">{formatDateTime(data.createdAt)}</span>
          </Field>
          <Field label="Última modificación">
            {data.updatedAt ? <span className="tabular-nums">{formatDateTime(data.updatedAt)}</span> : 'Sin cambios'}
          </Field>
        </dl>

        <section aria-labelledby="invoice-items" className="space-y-3">
          <h2 id="invoice-items" className="text-base font-semibold text-ink">
            Líneas
          </h2>
          <InvoiceItemsTable items={data.items} />
          <InvoiceTotals totals={data} />
        </section>
      </div>
    </>
  )
}
