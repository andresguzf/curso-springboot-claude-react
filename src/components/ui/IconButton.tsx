import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'
import { Link, type LinkProps } from 'react-router'
import { Spinner } from './Spinner.tsx'

type Tone = 'neutral' | 'danger' | 'band'

type IconProps = {
  /** Nombre accesible y texto de la ayuda visible ("Editar a Ana Pérez"). Obligatorio: el botón no tiene texto. */
  label: string
  icon: LucideIcon
  /** "danger" para eliminar (granate); "band" sobre la banda oscura del header. */
  tone?: Tone
}

const TONES: Record<Tone, string> = {
  neutral: 'text-ink-muted hover:bg-canvas hover:text-ink',
  danger: 'text-danger hover:bg-danger/10',
  band: 'text-white/80 hover:bg-white/10 hover:text-white',
}

const base =
  'group/icon relative inline-flex size-8 shrink-0 items-center justify-center rounded-control transition-colors disabled:cursor-not-allowed disabled:text-line-strong disabled:hover:bg-transparent'

// Ayuda visible al pasar el puntero o al enfocar con el teclado (title no aparece con teclado ni en
// táctil). Va a la izquierda del icono: las tablas tienen scroll propio y una ayuda arriba o abajo se
// cortaría en la primera o la última fila. Es decorativa (aria-hidden): el nombre ya está en aria-label.
function Tooltip({ label }: { label: string }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-full z-20 mr-1.5 -translate-y-1/2 rounded-control bg-ink px-2 py-1 text-xs font-medium whitespace-nowrap text-surface opacity-0 transition-opacity group-hover/icon:opacity-100 group-focus-visible/icon:opacity-100 motion-reduce:transition-none"
    >
      {label}
    </span>
  )
}

function Glyph({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon aria-hidden="true" size={17} strokeWidth={1.75} />
}

type IconButtonProps = Omit<ComponentProps<'button'>, 'children'> &
  IconProps & {
    /** Muestra un spinner en lugar del icono y bloquea el botón. */
    isPending?: boolean
  }

// Botón de una acción que se identifica por su icono (editar, eliminar, exportar…), 32 × 32 px.
export function IconButton({
  label,
  icon,
  tone = 'neutral',
  isPending = false,
  disabled,
  type = 'button',
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      aria-busy={isPending || undefined}
      disabled={disabled || isPending}
      className={`${base} ${TONES[tone]} ${className}`}
      {...props}
    >
      {isPending ? <Spinner label={label} /> : <Glyph icon={icon} />}
      <Tooltip label={label} />
    </button>
  )
}

type IconLinkProps = Omit<LinkProps, 'children'> & IconProps

// Lo mismo para una acción que navega (Editar abre otra pantalla): un Link, no un button.
export function IconLink({ label, icon, tone = 'neutral', className = '', ...props }: IconLinkProps) {
  return (
    <Link aria-label={label} className={`${base} ${TONES[tone]} ${className}`} {...props}>
      <Glyph icon={icon} />
      <Tooltip label={label} />
    </Link>
  )
}
