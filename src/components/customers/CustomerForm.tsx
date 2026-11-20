import { zodResolver } from '@hookform/resolvers/zod'
import { useId } from 'react'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { Link } from 'react-router'
import { customerFormSchema, type CustomerFormValues } from '../../schemas/customer.ts'
import { Button } from '../ui/Button.tsx'
import { buttonClassName } from '../ui/buttonStyles.ts'
import { FormField } from '../ui/FormField.tsx'
import { Input } from '../ui/Input.tsx'

type CustomerFormProps = {
  defaultValues: CustomerFormValues
  submitLabel: string
  isPending?: boolean
  /** Adónde vuelve "Cancelar". */
  cancelTo: string
  /** Recibe los valores ya validados y `setError`, para mostrar los errores del servidor por campo. */
  onSubmit: (values: CustomerFormValues, setError: UseFormSetError<CustomerFormValues>) => void
}

// Formulario de alta y edición (presentacional): valida con Zod y entrega los valores al padre,
// que llama a la API. Para cargar otro cliente, el padre le cambia la `key` (no se sincroniza
// con un effect).
export function CustomerForm({ defaultValues, submitLabel, isPending = false, cancelTo, onSubmit }: CustomerFormProps) {
  const activeId = useId()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CustomerFormValues>({ resolver: zodResolver(customerFormSchema), defaultValues })

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => onSubmit(values, setError))}
      className="space-y-6 rounded-panel border border-line bg-surface p-5 sm:p-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Nombre" error={errors.name?.message}>
          {(field) => <Input {...field} autoComplete="off" {...register('name')} />}
        </FormField>
        <FormField label="Apellido" error={errors.lastName?.message}>
          {(field) => <Input {...field} autoComplete="off" {...register('lastName')} />}
        </FormField>
        <FormField label="Email" error={errors.email?.message}>
          {(field) => <Input {...field} type="email" autoComplete="off" {...register('email')} />}
        </FormField>
        <FormField label="Teléfono" hint="Por ejemplo, +56 9 1234 5678" error={errors.phone?.message}>
          {(field) => <Input {...field} type="tel" autoComplete="off" className="tabular-nums" {...register('phone')} />}
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Dirección" error={errors.address?.message}>
            {(field) => <Input {...field} autoComplete="off" {...register('address')} />}
          </FormField>
        </div>
        <FormField label="Ciudad" error={errors.city?.message}>
          {(field) => <Input {...field} autoComplete="off" {...register('city')} />}
        </FormField>
        <FormField label="Fecha de nacimiento" error={errors.birthDate?.message}>
          {(field) => <Input {...field} type="date" className="tabular-nums" {...register('birthDate')} />}
        </FormField>
      </div>

      <div className="flex items-center gap-2.5">
        <input id={activeId} type="checkbox" className="size-4 accent-primary" {...register('active')} />
        <label htmlFor={activeId} className="text-[0.9375rem] text-ink">
          Cliente activo
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
