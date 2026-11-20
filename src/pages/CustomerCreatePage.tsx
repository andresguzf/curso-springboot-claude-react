import { useNavigate } from 'react-router'
import { CustomerForm } from '../components/customers/CustomerForm.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { useCreateCustomer } from '../hooks/useCustomers.ts'
import { useCustomersListPath } from '../hooks/useCustomersListPath.ts'
import { errorMessage } from '../lib/errors.ts'
import { applyServerErrors } from '../lib/serverErrors.ts'
import { CUSTOMER_FORM_FIELDS, EMPTY_CUSTOMER_FORM } from '../schemas/customer.ts'
import { flash } from '../stores/flashStore.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'

// Alta de cliente (solo ADMIN: la ruta está dentro de RequireRole).
export function CustomerCreatePage() {
  useDocumentTitle('Nuevo cliente')
  const navigate = useNavigate()
  const { listPath } = useCustomersListPath()
  const create = useCreateCustomer()

  return (
    <>
      <PageHeader title="Nuevo cliente" description="Todos los campos son obligatorios." />
      <div className="max-w-3xl">
        <CustomerForm
          defaultValues={EMPTY_CUSTOMER_FORM}
          submitLabel="Crear cliente"
          isPending={create.isPending}
          cancelTo={listPath}
          onSubmit={(values, setError) =>
            create.mutate(values, {
              // El flash ya lo publicó el hook; aquí solo se vuelve al listado.
              onSuccess: () => navigate(listPath),
              onError: (error) => {
                const shown = applyServerErrors(error, setError, {
                  fields: CUSTOMER_FORM_FIELDS,
                  conflict: { field: 'email', message: 'Ya existe un cliente con este email' },
                })
                if (!shown) flash.error(errorMessage(error, 'No se pudo crear el cliente. Inténtalo de nuevo.'))
              },
            })
          }
        />
      </div>
    </>
  )
}
