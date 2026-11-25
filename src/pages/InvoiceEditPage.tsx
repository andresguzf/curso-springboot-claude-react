import { Link, useNavigate, useParams } from 'react-router'
import { InvoiceForm } from '../components/invoices/InvoiceForm.tsx'
import { Button } from '../components/ui/Button.tsx'
import { EmptyState } from '../components/ui/EmptyState.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { Spinner } from '../components/ui/Spinner.tsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { useInvoice, useUpdateInvoice } from '../hooks/useInvoices.ts'
import { useListPath } from '../hooks/useListPath.ts'
import { errorMessage } from '../lib/errors.ts'
import { HttpError } from '../lib/http.ts'
import { applyServerErrors } from '../lib/serverErrors.ts'
import { INVOICE_FORM_FIELDS, invoiceToFormValues } from '../schemas/invoice.ts'
import { flash } from '../stores/flashStore.ts'

// Edición de factura (solo ADMIN: la ruta está dentro de RequireRole). El cliente y el número no
// cambian; al guardar se vuelve al detalle.
export function InvoiceEditPage() {
  const params = useParams()
  const id = Number(params.id)
  const navigate = useNavigate()
  const invoice = useInvoice(id)
  useDocumentTitle(invoice.data ? `Editar factura ${invoice.data.invoiceNumber}` : 'Editar factura')
  const update = useUpdateInvoice(id)
  const detailPath = `/invoices/${id}`
  // Filtros del listado que traía el detalle: se reenvían al volver para que «Volver a facturas» los conserve.
  const { listState } = useListPath('/invoices')

  const isNotFound = !Number.isInteger(id) || id <= 0 || (invoice.error instanceof HttpError && invoice.error.status === 404)

  if (isNotFound) {
    return (
      <EmptyState
        titleAs="h1"
        title="Factura no encontrada"
        description="Puede que se haya eliminado o que el enlace no sea correcto."
        action={
          <Link to="/invoices" className="text-sm font-medium text-accent-strong underline underline-offset-2">
            Volver a facturas
          </Link>
        }
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
        title={`Editar factura ${data.invoiceNumber}`}
        description="Al guardar, el sistema vuelve a calcular los importes."
      />
      <div className="max-w-4xl">
        {/* key={id}: si se pasa a editar otra factura, el formulario se reinicia con sus datos. */}
        <InvoiceForm
          key={data.id}
          customerName={data.customerName}
          defaultValues={invoiceToFormValues(data)}
          submitLabel="Guardar cambios"
          isPending={update.isPending}
          cancelTo={detailPath}
          onSubmit={(values, setError) =>
            update.mutate(
              { customerId: data.customerId, values },
              {
                onSuccess: () => navigate(detailPath, { state: listState }),
                onError: (error) => {
                  const shown = applyServerErrors(error, setError, { fields: INVOICE_FORM_FIELDS })
                  if (!shown) flash.error(errorMessage(error, 'No se pudieron guardar los cambios. Inténtalo de nuevo.'))
                },
              },
            )
          }
        />
      </div>
    </>
  )
}
