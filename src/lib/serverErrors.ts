import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { HttpError } from './http.ts'

type ServerErrorOptions<T extends FieldValues> = {
  /** Campos del formulario: solo a ellos se asignan los errores 400. */
  fields: readonly Path<T>[]
  /**
   * Dónde mostrar un 409 (valor duplicado) y con qué mensaje. Con `title`, solo los 409 con ese
   * título del ProblemDetail (p. ej. "Recurso duplicado"; en usuarios, otros 409 son reglas de admin).
   */
  conflict?: { field: Path<T>; message: string; title?: string }
}

// Lleva los errores del backend a los campos del formulario (React Hook Form):
// - 400 con `errors` (campo → mensaje): cada mensaje bajo su campo;
// - 409 (p. ej. email ya registrado): bajo el campo indicado en `conflict`.
// Devuelve false si no pudo asignar nada: el llamador decide (normalmente, un flash de error).
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  { fields, conflict }: ServerErrorOptions<T>,
): boolean {
  if (!(error instanceof HttpError)) return false

  if (error.status === 400 && error.fieldErrors) {
    const known = fields.filter((field) => error.fieldErrors?.[field] !== undefined)
    known.forEach((field, index) => {
      // El foco va al primer campo con error, como en la validación del cliente.
      setError(field, { type: 'server', message: error.fieldErrors?.[field] }, { shouldFocus: index === 0 })
    })
    return known.length > 0
  }

  if (error.status === 409 && conflict && (conflict.title === undefined || conflict.title === error.title)) {
    setError(conflict.field, { type: 'server', message: conflict.message }, { shouldFocus: true })
    return true
  }

  return false
}
