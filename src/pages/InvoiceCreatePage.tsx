import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'
import { InvoiceForm } from '../components/invoices/InvoiceForm.tsx'
import { Button } from '../components/ui/Button.tsx'
import { buttonClassName } from '../components/ui/buttonStyles.ts'
import { EmptyState } from '../components/ui/EmptyState.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { Spinner } from '../components/ui/Spinner.tsx'
import { useCustomer } from '../hooks/useCustomers.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { useCreateInvoice } from '../hooks/useInvoices.ts'
import { todayIsoDate } from '../lib/dates.ts'
import { errorMessage } from '../lib/errors.ts'
import { HttpError } from '../lib/http.ts'
import { applyServerErrors } from '../lib/serverErrors.ts'
import { EMPTY_INVOICE_ITEM, INVOICE_FORM_FIELDS, type InvoiceFormValues } from '../schemas/invoice.ts'
import { flash } from '../stores/flashStore.ts'

// ?customerId=3 → 3; ausente o inválido → 0 (la consulta del cliente no corre).
const customerIdParam = z.coerce.number().int().positive().catch(0)

// Alta de factura (solo ADMIN: la ruta está dentro de RequireRole). Se llega desde la ficha del
// cliente con /invoices/new?customerId=…: el cliente queda fijo en el formulario.
export function InvoiceCreatePage() {
  useDocumentTitle('Nueva factura')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const customerId = customerIdParam.parse(searchParams.get('customerId') ?? undefined)
  const customer = useCustomer(customerId)
  const create = useCreateInvoice()
  // Valores iniciales calculados una sola vez (la fecha de hoy no se lee durante cada render).
  const [defaultValues] = useState<InvoiceFormValues>(() => ({
    issueDate: todayIsoDate(),
    dueDate: '',
    status: 'PENDING',
    notes: '',
    items: [EMPTY_INVOICE_ITEM],
  }))

  const customersLink = (
    <Link to="/customers" className={buttonClassName({ variant: 'primary' })}>
      Ir a clientes
    </Link>
  )

  if (customerId === 0 || (customer.error instanceof HttpError && customer.error.status === 404)) {
    return (
      <EmptyState
        titleAs="h1"
        title="Elige un cliente"
        description="Las facturas se crean desde la ficha de cada cliente, con «Nueva factura»."
        action={customersLink}
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

  if (customer.isPending) {
    return (
      <div className="flex items-center justify-center gap-3 py-16 text-sm text-ink-muted">
        <Spinner className="size-5" /> Cargando cliente…
      </div>
    )
  }

  const customerName = `${customer.data.name} ${customer.data.lastName}`
  const customerPath = `/customers/${customerId}`

  return (
    <>
      <PageHeader title="Nueva factura" description="El número y los importes los asigna el sistema al guardar." />
      <div className="max-w-4xl">
        <InvoiceForm
          customerName={customerName}
          defaultValues={defaultValues}
          submitLabel="Crear factura"
          isPending={create.isPending}
          cancelTo={customerPath}
          onSubmit={(values, setError) =>
            create.mutate(
              { customerId, values },
              {
                // El flash ya lo publicó el hook; aquí solo se va al detalle de la factura nueva.
                onSuccess: (invoice) => navigate(`/invoices/${invoice.id}`),
                onError: (error) => {
                  const shown = applyServerErrors(error, setError, { fields: INVOICE_FORM_FIELDS })
                  if (!shown) flash.error(errorMessage(error, 'No se pudo crear la factura. Inténtalo de nuevo.'))
                },
              },
            )
          }
        />
      </div>
    </>
  )
}
