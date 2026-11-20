import type { ReactNode } from 'react'

type BadgeTone = 'neutral' | 'accent' | 'success' | 'danger' | 'warning'

type BadgeProps = {
  tone?: BadgeTone
  children: ReactNode
}

// Solo para estado y rol (Activo / Inactivo, Usuario / Administrador): texto en minúscula de oración.
const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-canvas text-ink-muted',
  accent: 'bg-accent-soft text-ink',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-warning/10 text-warning',
}

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-control px-2 py-0.5 text-[0.8125rem] font-medium ${TONES[tone]}`}>
      {children}
    </span>
  )
}
