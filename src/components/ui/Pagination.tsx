import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useId } from 'react'
import { pageWindow } from '../../lib/pagination.ts'
import { IconButton } from './IconButton.tsx'
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

// Páginas a cada lado de la actual: 3 desde `sm`; en pantallas chicas solo 1 (con CSS: los números
// más lejanos llevan `hidden sm:block`), así la paginación cabe a 375 px.
const RADIUS = 3
const MOBILE_RADIUS = 1

// «…» de un lado: visible en escritorio si la ventana de 3 deja páginas ocultas; si solo las deja la
// ventana de 1 (móvil), se oculta desde `sm`.
function gapClass(desktop: boolean, mobile: boolean): string | null {
  if (desktop) return ''
  return mobile ? 'sm:hidden' : null
}

const numberFormat = new Intl.NumberFormat('es-CL')

const pageButton =
  'inline-flex h-8 min-w-8 items-center justify-center rounded-control px-2 text-sm tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-50'

// Pie de la tabla: rango visible, tamaño de página y navegación por rango
// (Primera · Anterior · … 4 5 6 [7] 8 9 10 … · Siguiente · Última). Es presentacional: el padre
// guarda la página y el tamaño (en la URL) y recibe los cambios por callbacks.
export function Pagination({ page, size, totalElements, totalPages, sizes, onPageChange, onSizeChange }: PaginationProps) {
  const sizeId = useId()
  const from = totalElements === 0 ? 0 : (page - 1) * size + 1
  const to = Math.min(page * size, totalElements)
  const range = pageWindow(page, totalPages, RADIUS)
  const mobile = pageWindow(page, totalPages, MOBILE_RADIUS)
  const gapBefore = gapClass(range.gapBefore, mobile.gapBefore)
  const gapAfter = gapClass(range.gapAfter, mobile.gapAfter)
  const isFirst = page <= 1
  const isLast = page >= totalPages

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
            <ul className="flex items-center gap-1">
              <li>
                <IconButton label="Primera página" icon={ChevronsLeft} disabled={isFirst} onClick={() => onPageChange(1)} />
              </li>
              <li>
                <IconButton label="Página anterior" icon={ChevronLeft} disabled={isFirst} onClick={() => onPageChange(page - 1)} />
              </li>
              {gapBefore !== null && (
                <li aria-hidden="true" className={`px-1 ${gapBefore}`}>
                  …
                </li>
              )}
              {range.pages.map((item) => (
                <li key={item} className={Math.abs(item - page) > MOBILE_RADIUS ? 'hidden sm:block' : undefined}>
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
              ))}
              {gapAfter !== null && (
                <li aria-hidden="true" className={`px-1 ${gapAfter}`}>
                  …
                </li>
              )}
              <li>
                <IconButton label="Página siguiente" icon={ChevronRight} disabled={isLast} onClick={() => onPageChange(page + 1)} />
              </li>
              <li>
                <IconButton label="Última página" icon={ChevronsRight} disabled={isLast} onClick={() => onPageChange(totalPages)} />
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  )
}
