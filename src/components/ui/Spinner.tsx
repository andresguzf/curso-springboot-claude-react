type SpinnerProps = {
  /** Texto para lectores de pantalla. */
  label?: string
  className?: string
}

// Indicador de carga. Con prefers-reduced-motion deja de girar pero sigue visible.
export function Spinner({ label = 'Cargando', className = 'size-4' }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center">
      <svg
        className={`${className} animate-spin motion-reduce:animate-none`}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  )
}
