import type { ComponentProps } from 'react'
import { buttonClassName, type ButtonSize, type ButtonVariant } from './buttonStyles.ts'
import { Spinner } from './Spinner.tsx'

// ComponentProps<'button'> incluye `ref`: en React 19 es una prop más y llega al <button> con ...props.
type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Muestra un spinner y bloquea el botón mientras la acción está en curso (evita doble envío). */
  isPending?: boolean
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
      className={`${buttonClassName({ variant, size })} ${className}`}
      {...props}
    >
      {isPending && <Spinner label="Procesando" />}
      {children}
    </button>
  )
}
