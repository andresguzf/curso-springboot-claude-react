import type { z } from 'zod'

const API_URL: string = import.meta.env.VITE_API_URL ?? ''

export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

// Lee el mensaje de un error de la API (p. ej. un ProblemDetail RFC 9457 con `detail` o `title`).
async function errorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()
    if (body && typeof body === 'object') {
      const { detail, title, message } = body as Record<string, unknown>
      const text = detail ?? message ?? title
      if (typeof text === 'string') return text
    }
  } catch {
    // cuerpo vacío o no JSON
  }
  return `Error ${response.status}`
}

async function request(path: string, init: RequestInit = {}): Promise<unknown> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body !== undefined) headers.set('Content-Type', 'application/json')

  const response = await fetch(`${API_URL}${path}`, { ...init, headers })
  if (!response.ok) throw new HttpError(response.status, await errorMessage(response))
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
