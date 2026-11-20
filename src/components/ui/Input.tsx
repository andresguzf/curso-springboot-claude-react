import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

// Campo de texto con el estilo de la app. El error se marca con aria-invalid (lo pone FormField),
// así el estilo y la accesibilidad salen del mismo atributo.
export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`h-10 w-full rounded-control border border-line-strong bg-surface px-3 text-[0.9375rem] text-ink placeholder:text-ink-muted aria-invalid:border-danger disabled:bg-canvas disabled:text-ink-muted ${className}`}
      {...props}
    />
  )
}
