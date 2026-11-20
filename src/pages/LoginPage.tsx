import { Navigate, useLocation } from 'react-router'
import { z } from 'zod'
import { LoginForm } from '../components/auth/LoginForm.tsx'
import { Spinner } from '../components/ui/Spinner.tsx'
import { useAuth, useLogin } from '../hooks/useAuth.ts'
import { HttpError } from '../lib/http.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'

// RequireAuth (C-03) guarda en location.state la ruta que se intentaba abrir.
// El state es `unknown`: se valida con safeParse y, si no sirve, se vuelve al inicio.
const fromStateSchema = z.object({
  from: z.object({ pathname: z.string(), search: z.string().default(''), hash: z.string().default('') }),
})

function loginErrorMessage(error: Error | null): string | undefined {
  if (!error) return undefined
  if (error instanceof HttpError) {
    return error.status === 401
      ? 'Email o contraseña incorrectos'
      : (error.detail ?? 'No se pudo iniciar sesión. Intenta de nuevo en unos minutos.')
  }
  // fetch rechaza la promesa sin respuesta: backend caído o sin red.
  return 'No se pudo conectar con el servidor. Revisa que la API esté en marcha e intenta de nuevo.'
}

export function LoginPage() {
  useDocumentTitle('Iniciar sesión')
  const { status } = useAuth()
  const login = useLogin()
  const location = useLocation()

  const parsed = fromStateSchema.safeParse(location.state)
  const redirectTo = parsed.success ? `${parsed.data.from.pathname}${parsed.data.from.search}${parsed.data.from.hash}` : '/'

  // Con sesión (ya la tenía o acaba de entrar) no tiene sentido ver el login.
  if (status === 'authenticated') return <Navigate to={redirectTo} replace />

  // Mientras se comprueba la sesión al cargar no se muestra el formulario: podría haber sesión.
  if (status === 'checking') {
    return (
      <div className="flex justify-center py-10 text-ink-muted">
        <Spinner label="Comprobando la sesión" className="size-6" />
      </div>
    )
  }

  return (
    <section aria-labelledby="login-title" className="space-y-5">
      <h1 id="login-title" className="text-xl font-semibold text-ink">
        Inicia sesión
      </h1>
      <LoginForm
        onSubmit={(values) => login.mutate(values)}
        isPending={login.isPending}
        error={loginErrorMessage(login.error)}
      />
    </section>
  )
}
