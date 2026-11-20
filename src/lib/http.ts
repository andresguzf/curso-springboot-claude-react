import type { z } from 'zod'
import { problemDetailSchema } from '../schemas/common.ts'
import { userSchema, type User } from '../schemas/user.ts'

const API_URL: string = import.meta.env.VITE_API_URL ?? ''

const CSRF_COOKIE = 'XSRF-TOKEN'
const CSRF_HEADER = 'X-XSRF-TOKEN'
const CSRF_ENDPOINT = '/api/auth/csrf'
const REFRESH_ENDPOINT = '/api/auth/refresh'
const CSRF_INVALID_TITLE = 'Token CSRF inválido'
// El login es la única escritura que el backend no protege con CSRF.
const CSRF_EXEMPT = new Set(['/api/auth/login'])
// Endpoints de sesión: un 401 aquí es la respuesta final (no se intenta renovar la sesión).
// /api/auth/me sí renueva: así, al recargar la app con el access token vencido, la sesión sigue.
const NO_REFRESH = new Set(['/api/auth/login', REFRESH_ENDPOINT, '/api/auth/logout', CSRF_ENDPOINT])
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

// ---------------------------------------------------------------------------
// Conexión con la app: lib/ no importa stores ni el router; la app registra qué hacer.
// ---------------------------------------------------------------------------

type AuthHandlers = {
  /** La sesión se renovó: el backend devuelve el usuario actual (su rol puede haber cambiado). */
  onRefreshed: (user: User) => void
  /** No se pudo renovar la sesión: hay que volver al login. */
  onSessionExpired: () => void
}

let authHandlers: AuthHandlers = { onRefreshed: () => {}, onSessionExpired: () => {} }

export function setAuthHandlers(handlers: AuthHandlers): void {
  authHandlers = handlers
}

// ---------------------------------------------------------------------------
// Errores
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// CSRF
// ---------------------------------------------------------------------------

function readCookie(name: string): string | undefined {
  const row = document.cookie.split('; ').find((cookie) => cookie.startsWith(`${name}=`))
  return row === undefined ? undefined : decodeURIComponent(row.slice(name.length + 1))
}

// GET /api/auth/csrf crea (o renueva) la cookie XSRF-TOKEN. La promesa se comparte para que
// varias escrituras simultáneas no la pidan a la vez.
let csrfRequest: Promise<void> | null = null

function renewCsrfCookie(): Promise<void> {
  csrfRequest ??= fetch(`${API_URL}${CSRF_ENDPOINT}`, { credentials: 'include' })
    .then(() => undefined)
    .finally(() => {
      csrfRequest = null
    })
  return csrfRequest
}

async function csrfToken(): Promise<string | undefined> {
  if (readCookie(CSRF_COOKIE) === undefined) await renewCsrfCookie()
  return readCookie(CSRF_COOKIE)
}

// ---------------------------------------------------------------------------
// Renovación de sesión
// ---------------------------------------------------------------------------

// Un solo POST /api/auth/refresh a la vez, compartido por todas las peticiones que reciben 401.
// Es obligatorio, no una optimización: el backend rota el refresh token y detecta reusos, así que
// dos /refresh en paralelo con la misma cookie revocarían todas las sesiones del usuario.
let refreshing: Promise<User | null> | null = null

function refreshOnce(): Promise<User | null> {
  refreshing ??= doRefresh()
    .then((user) => {
      // Se avisa una sola vez por renovación, aunque esperen varias peticiones.
      if (user) authHandlers.onRefreshed(user)
      else authHandlers.onSessionExpired()
      return user
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

async function doRefresh(): Promise<User | null> {
  try {
    const response = await send(REFRESH_ENDPOINT, { method: 'POST' }, { accept: 'application/json', retry: false })
    if (!response.ok) return null
    return userSchema.parse(await response.json())
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Envío con reintentos
// ---------------------------------------------------------------------------

type SendOptions = {
  accept: string
  /** false en el reintento: cada petición se reintenta como máximo una vez. */
  retry: boolean
}

async function send(path: string, init: RequestInit, options: SendOptions): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  headers.set('Accept', options.accept)
  if (init.body !== undefined) headers.set('Content-Type', 'application/json')
  if (!SAFE_METHODS.has(method) && !CSRF_EXEMPT.has(path)) {
    const token = await csrfToken()
    if (token !== undefined) headers.set(CSRF_HEADER, token)
  }

  // credentials: 'include' envía las cookies HttpOnly de sesión (el frontend nunca toca los tokens).
  const response = await fetch(`${API_URL}${path}`, { ...init, method, headers, credentials: 'include' })
  if (response.ok || !options.retry) return response

  // 401: access token vencido o ausente → renovar la sesión una vez y repetir la petición.
  if (response.status === 401 && !NO_REFRESH.has(path)) {
    const user = await refreshOnce()
    return user ? send(path, init, { ...options, retry: false }) : response
  }

  // 403 por token CSRF inválido (p. ej. la cookie cambió en otra pestaña) → renovarlo y repetir una vez.
  if (response.status === 403 && (await isCsrfError(response))) {
    await renewCsrfCookie()
    return send(path, init, { ...options, retry: false })
  }

  return response
}

async function isCsrfError(response: Response): Promise<boolean> {
  try {
    const body: unknown = await response.clone().json()
    return problemDetailSchema.safeParse(body).data?.title === CSRF_INVALID_TITLE
  } catch {
    return false
  }
}

async function request(path: string, init: RequestInit = {}): Promise<unknown> {
  const response = await send(path, init, { accept: 'application/json', retry: true })
  if (!response.ok) throw await toHttpError(response)
  if (response.status === 204) return undefined
  return response.json()
}

// Nombre del archivo desde Content-Disposition: filename*=UTF-8''clientes.csv o filename="clientes.csv".
function filenameFrom(response: Response, fallback: string): string {
  const disposition = response.headers.get('Content-Disposition') ?? ''
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(disposition)
  if (encoded) return decodeURIComponent(encoded[1])
  const plain = /filename="?([^";]+)"?/i.exec(disposition)
  return plain ? plain[1] : fallback
}

const toBody = (body: unknown): string | undefined => (body === undefined ? undefined : JSON.stringify(body))

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

// Cada respuesta se valida con un esquema Zod: si la API cambia, el error aparece aquí
// y no como un `undefined` perdido en un componente.
export const http = {
  get: async <T>(path: string, schema: z.ZodType<T>): Promise<T> =>
    schema.parse(await request(path)),

  post: async <T>(path: string, body: unknown, schema: z.ZodType<T>): Promise<T> =>
    schema.parse(await request(path, { method: 'POST', body: toBody(body) })),

  put: async <T>(path: string, body: unknown, schema: z.ZodType<T>): Promise<T> =>
    schema.parse(await request(path, { method: 'PUT', body: toBody(body) })),

  delete: async (path: string): Promise<void> => {
    await request(path, { method: 'DELETE' })
  },

  /**
   * Descarga un archivo (exportaciones CSV, Excel, PDF, XML) pasando por la misma renovación de
   * sesión que el resto de peticiones. Un `<a href>` directo con el token vencido descargaría
   * un ProblemDetail en vez del archivo. `fallbackName` se usa si la respuesta no trae
   * Content-Disposition (p. ej. el XML).
   */
  download: async (
    path: string,
    accept: string,
    fallbackName = 'descarga',
  ): Promise<{ blob: Blob; filename: string }> => {
    const response = await send(path, {}, { accept, retry: true })
    if (!response.ok) throw await toHttpError(response)
    return { blob: await response.blob(), filename: filenameFrom(response, fallbackName) }
  },
}
