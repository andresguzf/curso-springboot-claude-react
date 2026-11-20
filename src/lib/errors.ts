import { HttpError } from './http.ts'

// Texto para mostrar al usuario cuando falla una petición: el `detail` del ProblemDetail si
// el backend lo envía; si no, `fallback`. Sin respuesta (backend caído o sin red), lo dice.
export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpError) return error.detail ?? fallback
  return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'
}
