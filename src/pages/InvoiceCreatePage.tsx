import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'
import { InvoiceForm } from '../components/invoices/InvoiceForm.tsx'
import { Button } from '../components/ui/Button.tsx'
import { EmptyState } from '../components/ui/EmptyState.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { Spinner } from '../components/ui/Spinner.tsx'
import { useCustomer } from '../hooks/useCustomers.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { useCreateInvoice } from '../hooks/useInvoices.ts'
import { useListPath } from '../hooks/useListPath.ts'
import { todayIsoDate } from '../lib/dates.ts'
import { errorMessage } from '../lib/errors.ts'
import { HttpError } from '../lib/http.ts'
import { applyServerErrors } from '../lib/serverErrors.ts'
import { EMPTY_INVOICE_ITEM, INVOICE_FORM_FIELDS, type InvoiceFormValues } from '../schemas/invoice.ts'
import { flash } from '../stores/flashStore.ts'

// ?customerId=3 → 3; ausente o inválido → 0 (sin cliente fijo: se elige con el autocompletado).
const customerIdParam = z.coerce.number().int().positive().catch(0)

// Alta de factura (solo ADMIN: la ruta está dentro de RequireRole). Dos entradas:
// - desde la ficha del cliente (/invoices/new?customerId=…): el cliente llega fijo;
// - desde el listado de facturas (/invoices/new): el cliente se busca con el autocompletado (spec 11).
export function InvoiceCreatePage() {
  useDocumentTitle('Nueva factura')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const customerId = customerIdParam.parse(searchParams.get('customerId') ?? undefined)
  const customer = useCustomer(customerId)
  const create = useCreateInvoice()
  const { listPath } = useListPath('/invoices')
  // Valores iniciales calculados una sola vez (la fecha de hoy no se lee durante cada render).
  const [defaultValues] = useState<InvoiceFormValues>(() => ({
    customerId,
    issueDate: todayIsoDate(),
    dueDate: '',
    status: 'PENDING',
    notes: '',
    items: [EMPTY_INVOICE_ITEM],
  }))

  if (customer.error instanceof HttpError && customer.error.status === 404) {
    return (
      <EmptyState
        titleAs="h1"
        title="Cliente no encontrado"
        description="Puede que se haya eliminado o que el enlace no sea correcto. Puedes crear la factura eligiendo otro cliente."
        action={
          <Link to="/invoices/new" className="text-sm font-medium text-accent-strong underline underline-offset-2">
            Nueva factura
          </Link>
        }
      />
    )
  }

  if (customer.isError) {
    return (
      <EmptyState
        titleAs="h1"
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

  // Con cliente en la URL, se espera a tenerlo (sin cliente la consulta no corre y el formulario va directo).
  if (customerId !== 0 && customer.isPending) {
    return (
      <div className="flex items-center justify-center gap-3 py-16 text-sm text-ink-muted">
        <Spinner className="size-5" /> Cargando cliente…
      </div>
    )
  }

  const customerName = customer.data ? `${customer.data.name} ${customer.data.lastName}` : undefined

  return (
    <>
      <PageHeader title="Nueva factura" description="El número y los importes los asigna el sistema al guardar." />
      <div className="max-w-4xl">
        <InvoiceForm
          customerName={customerName}
          defaultValues={defaultValues}
          submitLabel="Crear factura"
          isPending={create.isPending}
          // Cancelar vuelve a donde se abrió el alta: la ficha del cliente o el listado de facturas.
          cancelTo={customerId !== 0 ? `/customers/${customerId}` : listPath}
          onSubmit={(values, setError) =>
            create.mutate(values, {
              // El flash ya lo publicó el hook; aquí solo se va al detalle de la factura nueva.
              onSuccess: (invoice) => navigate(`/invoices/${invoice.id}`),
              onError: (error) => {
                const shown = applyServerErrors(error, setError, { fields: INVOICE_FORM_FIELDS })
                if (!shown) flash.error(errorMessage(error, 'No se pudo crear la factura. Inténtalo de nuevo.'))
              },
            })
          }
        />
      </div>
    </>
  )
}
