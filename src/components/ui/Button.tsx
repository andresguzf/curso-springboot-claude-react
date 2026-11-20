import type { ComponentProps } from 'react'
import { Spinner } from './Spinner.tsx'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md'

// ComponentProps<'button'> incluye `ref`: en React 19 es una prop más y llega al <button> con ...props.
type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Muestra un spinner y bloquea el botón mientras la acción está en curso (evita doble envío). */
  isPending?: boolean
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-canvas',
  danger: 'bg-danger text-white hover:bg-danger/90',
  ghost: 'text-ink hover:bg-canvas',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-[0.9375rem]',
}

// Botón de la app. Por defecto type="button": así un botón dentro de un formulario no lo envía
// por accidente; el de envío debe declarar type="submit".
export function Button({
  variant = 'secondary',
  size = 'md',
  isPending = false,
  disabled,
  type = 'button',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isPending}
      aria-busy={isPending || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {isPending && <Spinner label="Procesando" />}
      {children}
    </button>
  )
}
