import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description?: string
  /** Lo que el usuario puede hacer a continuación (un Button o un Link). */
  action?: ReactNode
  /** `h1` cuando el estado vacío es toda la página (p. ej. "Cliente no encontrado"). */
  titleAs?: 'p' | 'h1'
}

// Un estado vacío es una invitación a actuar: dice qué pasa y qué hacer, sin disculparse.
export function EmptyState({ title, description, action, titleAs: Title = 'p' }: EmptyStateProps) {
  return (
    <div className="rounded-panel border border-dashed border-line bg-surface px-6 py-10 text-center">
      <Title className="text-[0.9375rem] font-medium text-ink">{title}</Title>
      {description && <p className="mx-auto mt-1 max-w-prose text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}
