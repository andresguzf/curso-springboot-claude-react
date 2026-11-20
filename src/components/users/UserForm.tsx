import { zodResolver } from '@hookform/resolvers/zod'
import { useId } from 'react'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { Link } from 'react-router'
import { ROLE_LABELS, userCreateSchema, userUpdateSchema, type UserFormValues } from '../../schemas/user.ts'
import { Button } from '../ui/Button.tsx'
import { buttonClassName } from '../ui/buttonStyles.ts'
import { FormField } from '../ui/FormField.tsx'
import { Input } from '../ui/Input.tsx'
import { Select } from '../ui/Select.tsx'

type UserFormProps = {
  /** create: contraseña obligatoria; edit: opcional (vacía conserva la actual). */
  mode: 'create' | 'edit'
  defaultValues: UserFormValues
  submitLabel: string
  isPending?: boolean
  cancelTo: string
  /** Valores validados y `setError`, para mostrar los errores del servidor por campo. */
  onSubmit: (values: UserFormValues, setError: UseFormSetError<UserFormValues>) => void
}

// Formulario de alta y edición de usuarios (presentacional). Para cargar otro usuario, el padre
// le cambia la `key`.
export function UserForm({ mode, defaultValues, submitLabel, isPending = false, cancelTo, onSubmit }: UserFormProps) {
  const enabledId = useId()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(mode === 'create' ? userCreateSchema : userUpdateSchema),
    defaultValues,
  })

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => onSubmit(values, setError))}
      className="space-y-6 rounded-panel border border-line bg-surface p-5 sm:p-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField label="Email" error={errors.email?.message}>
            {(field) => <Input {...field} type="email" autoComplete="off" {...register('email')} />}
          </FormField>
        </div>
        <FormField
          label={mode === 'create' ? 'Contraseña' : 'Nueva contraseña'}
          hint={mode === 'create' ? 'Entre 8 y 72 caracteres.' : 'Déjala vacía para conservar la actual.'}
          error={errors.password?.message}
        >
          {(field) => <Input {...field} type="password" autoComplete="new-password" {...register('password')} />}
        </FormField>
        <FormField label="Rol" error={errors.role?.message}>
          {(field) => (
            <Select {...field} {...register('role')}>
              <option value="USER">{ROLE_LABELS.USER}</option>
              <option value="ADMIN">{ROLE_LABELS.ADMIN}</option>
            </Select>
          )}
        </FormField>
      </div>

      <div className="flex items-center gap-2.5">
        <input id={enabledId} type="checkbox" className="size-4 accent-primary" {...register('enabled')} />
        <label htmlFor={enabledId} className="text-[0.9375rem] text-ink">
          Usuario habilitado (puede iniciar sesión)
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <Button type="submit" variant="primary" isPending={isPending}>
          {submitLabel}
        </Button>
        <Link to={cancelTo} className={buttonClassName({ variant: 'ghost' })}>
          Cancelar
        </Link>
      </div>
    </form>
  )
}
