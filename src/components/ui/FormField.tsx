import { useId, type ReactNode } from 'react'

// Atributos que el campo debe recibir para quedar asociado a su etiqueta, ayuda y error.
export type FieldControlProps = {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: true
}

type FormFieldProps = {
  label: string
  hint?: string
  error?: string
  /** Recibe los atributos de accesibilidad y devuelve el campo: {(field) => <Input {...field} />} */
  children: (field: FieldControlProps) => ReactNode
}

// Etiqueta + campo + ayuda + error, asociados por id (label for, aria-describedby, aria-invalid).
export function FormField({ label, hint, error, children }: FormFieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {hint && !error && (
        <p id={hintId} className="text-[0.8125rem] text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-[0.8125rem] text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
