type TableSkeletonProps = {
  /** Texto para lectores de pantalla ("Cargando clientes"). */
  label: string
  columns?: number
  rows?: number
}

// Esqueleto de tabla para la primera carga: misma caja, cabecera y alto de fila (44 px) que
// DataTable, así la página no salta cuando llegan los datos. El pulso se apaga con
// prefers-reduced-motion.
export function TableSkeleton({ label, columns = 5, rows = 6 }: TableSkeletonProps) {
  const cells = Array.from({ length: columns }, (_, index) => index)
  return (
    <div aria-busy="true" className="overflow-hidden rounded-panel border border-line bg-surface">
      <span role="status" className="sr-only">
        {label}
      </span>
      <div aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
        <div className="flex h-11 items-center gap-6 border-b border-line px-3">
          {cells.map((cell) => (
            <div key={cell} className="h-3 flex-1 rounded-control bg-line" />
          ))}
        </div>
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="flex h-11 items-center gap-6 border-b border-line px-3 last:border-b-0">
            {cells.map((cell) => (
              <div key={cell} className={`h-3 flex-1 rounded-control bg-canvas ${cell === 0 ? 'max-w-48' : ''}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
