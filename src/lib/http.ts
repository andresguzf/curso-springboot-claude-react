import type { z } from 'zod'
import { problemDetailSchema } from '../schemas/common.ts'

const API_URL: string = import.meta.env.VITE_API_URL ?? ''

const CSRF_COOKIE = 'XSRF-TOKEN'
const CSRF_HEADER = 'X-XSRF-TOKEN'
const CSRF_ENDPOINT = '/api/auth/csrf'
// El login es la única escritura que el backend no protege con CSRF.
const CSRF_EXEMPT = new Set(['/api/auth/login'])
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

// Error de una respuesta HTTP no exitosa, armado desde el ProblemDetail del backend.
export class HttpError extends Error {
  readonly status: number
  readonly title?: string
  readonly detail?: string
  readonly fieldErrors?: Record<string, string>

  constructor(
    status: number,
    message: string,
    problem: { title?: string; detail?: string; fieldErrors?: Record<string, string> } = {},
  ) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.title = problem.title
    this.detail = problem.detail
    this.fieldErrors = problem.fieldErrors
  }
}

async function toHttpError(response: Response): Promise<HttpError> {
  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    // cuerpo vacío o no JSON
  }
  const parsed = problemDetailSchema.safeParse(body)
  if (!parsed.success) return new HttpError(response.status, `Error ${response.status}`)
  const { title, detail, errors } = parsed.data
  return new HttpError(response.status, detail ?? title ?? `Error ${response.status}`, {
    title,
    detail,
    fieldErrors: errors,
  })
}

function readCookie(name: string): string | undefined {
  const row = document.cookie.split('; ').find((cookie) => cookie.startsWith(`${name}=`))
  return row === undefined ? undefined : decodeURIComponent(row.slice(name.length + 1))
}

// Si aún no existe la cookie XSRF-TOKEN, el backend la crea en GET /api/auth/csrf.
// La promesa se comparte para que varias escrituras simultáneas no la pidan a la vez.
let csrfRequest: Promise<void> | null = null

function ensureCsrfCookie(): Promise<void> {
  csrfRequest ??= fetch(`${API_URL}${CSRF_ENDPOINT}`, { credentials: 'include' })
    .then(() => undefined)
    .finally(() => {
      csrfRequest = null
    })
  return csrfRequest
}

async function csrfToken(): Promise<string | undefined> {
  if (readCookie(CSRF_COOKIE) === undefined) await ensureCsrfCookie()
  return readCookie(CSRF_COOKIE)
}

async function request(path: string, init: RequestInit = {}): Promise<unknown> {
  const method = (init.method ?? 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body !== undefined) headers.set('Content-Type', 'application/json')
  if (!SAFE_METHODS.has(method) && !CSRF_EXEMPT.has(path)) {
    const token = await csrfToken()
    if (token !== undefined) headers.set(CSRF_HEADER, token)
  }

  // credentials: 'include' envía las cookies HttpOnly de sesión (el frontend nunca toca los tokens).
  const response = await fetch(`${API_URL}${path}`, { ...init, method, headers, credentials: 'include' })
  if (!response.ok) throw await toHttpError(response)
  if (response.status === 204) return undefined
  return response.json()
}

// Cada respuesta se valida con un esquema Zod: si la API cambia, el error aparece aquí
// y no como un `undefined` perdido en un componente.
export const http = {
  get: async <T>(path: string, schema: z.ZodType<T>): Promise<T> =>
    schema.parse(await request(path)),

  post: async <T>(path: string, body: unknown, schema: z.ZodType<T>): Promise<T> =>
    schema.parse(await request(path, { method: 'POST', body: JSON.stringify(body) })),

  put: async <T>(path: string, body: unknown, schema: z.ZodType<T>): Promise<T> =>
    schema.parse(await request(path, { method: 'PUT', body: JSON.stringify(body) })),

  delete: async (path: string): Promise<void> => {
    await request(path, { method: 'DELETE' })
  },
}
