import { useNavigate } from 'react-router'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { UserForm } from '../components/users/UserForm.tsx'
import { useListPath } from '../hooks/useListPath.ts'
import { useCreateUser } from '../hooks/useUsers.ts'
import { errorMessage } from '../lib/errors.ts'
import { applyServerErrors } from '../lib/serverErrors.ts'
import { EMPTY_USER_FORM, USER_FORM_FIELDS } from '../schemas/user.ts'
import { flash } from '../stores/flashStore.ts'

// Alta de usuario (ruta dentro de RequireRole ADMIN).
export function UserCreatePage() {
  const navigate = useNavigate()
  const { listPath } = useListPath('/users')
  const create = useCreateUser()

  return (
    <>
      <PageHeader title="Nuevo usuario" description="Podrá iniciar sesión con este email y contraseña." />
      <div className="max-w-2xl">
        <UserForm
          mode="create"
          defaultValues={EMPTY_USER_FORM}
          submitLabel="Crear usuario"
          isPending={create.isPending}
          cancelTo={listPath}
          onSubmit={(values, setError) =>
            create.mutate(values, {
              onSuccess: () => navigate(listPath),
              onError: (error) => {
                const shown = applyServerErrors(error, setError, {
                  fields: USER_FORM_FIELDS,
                  conflict: { field: 'email', message: 'Ya existe un usuario con este email', title: 'Recurso duplicado' },
                })
                if (!shown) flash.error(errorMessage(error, 'No se pudo crear el usuario. Inténtalo de nuevo.'))
              },
            })
          }
        />
      </div>
    </>
  )
}
