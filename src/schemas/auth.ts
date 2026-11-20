import { z } from 'zod'

// Formulario de login. Solo valida forma; si las credenciales son correctas lo decide el backend.
export const loginSchema = z.object({
  email: z.string().min(1, 'Ingresa tu email').pipe(z.email('Ingresa un email válido')),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

export type LoginValues = z.infer<typeof loginSchema>
