import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description?: string
  /** Acciones de la página (p. ej. Exportar, Nuevo cliente), alineadas a la derecha. */
  actions?: ReactNode
}

// Encabezado de cada página: el único h1 y la única tipografía grande de la pantalla.
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[1.75rem] leading-tight font-semibold text-ink">{title}</h1>
        {description && <p className="mt-1 max-w-prose text-[0.9375rem] text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
