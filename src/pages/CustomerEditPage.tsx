import { Link, useNavigate, useParams } from 'react-router'
import { CustomerForm } from '../components/customers/CustomerForm.tsx'
import { Button } from '../components/ui/Button.tsx'
import { EmptyState } from '../components/ui/EmptyState.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { Spinner } from '../components/ui/Spinner.tsx'
import { useCustomer, useUpdateCustomer } from '../hooks/useCustomers.ts'
import { useCustomersListPath } from '../hooks/useCustomersListPath.ts'
import { errorMessage } from '../lib/errors.ts'
import { HttpError } from '../lib/http.ts'
import { applyServerErrors } from '../lib/serverErrors.ts'
import { CUSTOMER_FORM_FIELDS, type Customer, type CustomerFormValues } from '../schemas/customer.ts'
import { flash } from '../stores/flashStore.ts'

// Solo los campos editables: id y fechas de auditoría los asigna el backend.
function toFormValues(customer: Customer): CustomerFormValues {
  const { name, lastName, email, phone, address, city, birthDate, active } = customer
  return { name, lastName, email, phone, address, city, birthDate, active }
}

// Edición de cliente (solo ADMIN: la ruta está dentro de RequireRole).
export function CustomerEditPage() {
  const params = useParams()
  const id = Number(params.id)
  const navigate = useNavigate()
  const { listPath } = useCustomersListPath()
  const customer = useCustomer(id)
  const update = useUpdateCustomer(id)

  const isNotFound = !Number.isInteger(id) || id <= 0 || (customer.error instanceof HttpError && customer.error.status === 404)

  if (isNotFound) {
    return (
      <EmptyState
        title="Cliente no encontrado"
        description="Puede que se haya eliminado o que el enlace no sea correcto."
        action={
          <Link to={listPath} className="text-sm font-medium text-accent-strong underline underline-offset-2">
            Volver a clientes
          </Link>
        }
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
      <PageHeader title={`Editar a ${data.name} ${data.lastName}`} />
      <div className="max-w-3xl">
        {/* key={id}: si se pasa a editar otro cliente, el formulario se reinicia con sus datos. */}
        <CustomerForm
          key={data.id}
          defaultValues={toFormValues(data)}
          submitLabel="Guardar cambios"
          isPending={update.isPending}
          cancelTo={listPath}
          onSubmit={(values, setError) =>
            update.mutate(values, {
              onSuccess: () => navigate(listPath),
              onError: (error) => {
                const shown = applyServerErrors(error, setError, {
                  fields: CUSTOMER_FORM_FIELDS,
                  conflict: { field: 'email', message: 'Ya existe un cliente con este email' },
                })
                if (!shown) flash.error(errorMessage(error, 'No se pudieron guardar los cambios. Inténtalo de nuevo.'))
              },
            })
          }
        />
      </div>
    </>
  )
}
