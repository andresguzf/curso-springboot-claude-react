import { useId } from 'react'
import { Select } from './Select.tsx'

type PaginationProps = {
  /** Página actual, desde 1. */
  page: number
  size: number
  totalElements: number
  totalPages: number
  sizes: readonly number[]
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
}

type PageItem = number | 'gap-start' | 'gap-end'

// Números a mostrar: primera, última, la actual y sus vecinas; el resto se resume con "…".
// 1 … 4 5 6 … 12. Con 7 páginas o menos se muestran todas.
function pageItems(current: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  const start = Math.max(2, Math.min(current - 1, total - 4))
  const end = Math.min(total - 1, Math.max(current + 1, 5))
  const middle = Array.from({ length: end - start + 1 }, (_, index) => start + index)
  return [1, ...(start > 2 ? ['gap-start' as const] : []), ...middle, ...(end < total - 1 ? ['gap-end' as const] : []), total]
}

const numberFormat = new Intl.NumberFormat('es-CL')

const pageButton =
  'inline-flex h-8 min-w-8 items-center justify-center rounded-control px-2 text-sm tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-50'

// Pie de la tabla: rango visible, tamaño de página y navegación. Es presentacional: el padre
// guarda la página y el tamaño (en la URL) y recibe los cambios por callbacks.
export function Pagination({ page, size, totalElements, totalPages, sizes, onPageChange, onSizeChange }: PaginationProps) {
  const sizeId = useId()
  const from = totalElements === 0 ? 0 : (page - 1) * size + 1
  const to = Math.min(page * size, totalElements)

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm text-ink-muted">
      <p className="tabular-nums" aria-live="polite">
        {totalElements === 0
          ? 'Sin resultados'
          : `Mostrando ${numberFormat.format(from)}–${numberFormat.format(to)} de ${numberFormat.format(totalElements)}`}
      </p>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <label htmlFor={sizeId} className="whitespace-nowrap">
            Por página
          </label>
          {/* Select ocupa todo el ancho de su contenedor: aquí el contenedor fija uno chico. */}
          <div className="w-18">
            <Select
              id={sizeId}
              value={size}
              onChange={(event) => onSizeChange(Number(event.target.value))}
              className="h-8 text-sm tabular-nums"
            >
              {sizes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {totalPages > 1 && (
          <nav aria-label="Paginación">
            <ul className="flex flex-wrap items-center gap-1">
              <li>
                <button
                  type="button"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1}
                  className={`${pageButton} text-ink hover:bg-canvas`}
                >
                  Anterior
                </button>
              </li>
              {pageItems(page, totalPages).map((item) =>
                typeof item === 'number' ? (
                  <li key={item}>
                    <button
                      type="button"
                      onClick={() => onPageChange(item)}
                      aria-label={`Página ${item}`}
                      aria-current={item === page ? 'page' : undefined}
                      className={`${pageButton} ${item === page ? 'bg-accent-soft font-semibold text-ink' : 'text-ink hover:bg-canvas'}`}
                    >
                      {item}
                    </button>
                  </li>
                ) : (
                  <li key={item} aria-hidden="true" className="px-1">
                    …
                  </li>
                ),
              )}
              <li>
                <button
                  type="button"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages}
                  className={`${pageButton} text-ink hover:bg-canvas`}
                >
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  )
}
