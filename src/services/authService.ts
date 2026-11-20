import { z } from 'zod'
import { http } from '../lib/http.ts'
import { userSchema } from '../schemas/user.ts'

// Respuesta de GET /api/auth/csrf (además crea la cookie XSRF-TOKEN).
const csrfTokenSchema = z.object({
  headerName: z.string(),
  parameterName: z.string(),
  token: z.string(),
})

type Credentials = {
  email: string
  password: string
}

// Endpoints de /api/auth. Los tokens viajan solo en cookies HttpOnly: ninguna respuesta los trae.
export const authService = {
  csrf: () => http.get('/api/auth/csrf', csrfTokenSchema),
  login: (credentials: Credentials) => http.post('/api/auth/login', credentials, userSchema),
  refresh: () => http.post('/api/auth/refresh', undefined, userSchema),
  logout: () => http.post('/api/auth/logout', undefined, z.undefined()),
  me: () => http.get('/api/auth/me', userSchema),
}
