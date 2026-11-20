import type { SelectHTMLAttributes } from 'react'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

// Lista desplegable nativa (accesible y usable en móvil) con el estilo de los demás campos.
export function Select({ className = '', children, ...props }: SelectProps) {
  return (
    <select
      className={`h-10 w-full rounded-control border border-line-strong bg-surface px-3 text-[0.9375rem] text-ink aria-invalid:border-danger disabled:bg-canvas disabled:text-ink-muted ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
