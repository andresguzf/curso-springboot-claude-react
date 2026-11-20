export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md'

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

// Clases de un botón. Las usan <Button> y los enlaces que deben verse como botón
// (<Link className={buttonClassName({ variant: 'primary' })}>), que navegan en vez de ejecutar.
export function buttonClassName({ variant = 'secondary', size = 'md' }: { variant?: ButtonVariant; size?: ButtonSize } = {}) {
  return `inline-flex items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]}`
}
