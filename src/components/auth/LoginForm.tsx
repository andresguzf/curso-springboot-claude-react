import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { loginSchema, type LoginValues } from '../../schemas/auth.ts'
import { Button } from '../ui/Button.tsx'
import { FormField } from '../ui/FormField.tsx'
import { Input } from '../ui/Input.tsx'

type LoginFormProps = {
  onSubmit: (values: LoginValues) => void
  isPending?: boolean
  /** Error general de la API (credenciales incorrectas, servidor caído). */
  error?: string
}

const EMPTY: LoginValues = { email: '', password: '' }

// Formulario presentacional: valida con Zod y entrega los valores al padre, que llama a la API.
export function LoginForm({ onSubmit, isPending = false, error }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: EMPTY })

  return (
    // noValidate: los mensajes los pone Zod (en español y con el estilo de la app), no el navegador.
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <p role="alert" className="rounded-control border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <FormField label="Email" error={errors.email?.message}>
        {(field) => <Input {...field} type="email" autoComplete="username" {...register('email')} />}
      </FormField>

      <FormField label="Contraseña" error={errors.password?.message}>
        {(field) => <Input {...field} type="password" autoComplete="current-password" {...register('password')} />}
      </FormField>

      <Button type="submit" variant="primary" isPending={isPending} className="w-full">
        Entrar
      </Button>
    </form>
  )
}
