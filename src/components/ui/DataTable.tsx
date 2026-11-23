import type { ReactNode } from 'react'

export type SortDirection = 'asc' | 'desc'

// Ancho mínimo del CONTENEDOR de la tabla (container queries de Tailwind) desde el que se ve una
// columna. Al ser el ancho del contenedor y no de la ventana, abrir o colapsar el sidebar de filtros
// reacomoda las columnas solo. Clases escritas completas para que Tailwind las detecte.
export type ColumnMinWidth = 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'

const VISIBLE_FROM: Record<ColumnMinWidth, string> = {
  md: 'hidden @md:table-cell', // 28rem = 448 px
  lg: 'hidden @lg:table-cell', // 32rem = 512 px
  xl: 'hidden @xl:table-cell', // 36rem = 576 px
  '2xl': 'hidden @2xl:table-cell', // 42rem = 672 px
  '3xl': 'hidden @3xl:table-cell', // 48rem = 768 px
  '4xl': 'hidden @4xl:table-cell', // 56rem = 896 px
  '5xl': 'hidden @5xl:table-cell', // 64rem = 1024 px
}

export type DataTableColumn<T> = {
  key: string
  header: string
  cell: (row: T) => ReactNode
  /** Campo que se envía a la API para ordenar ("lastName"); sin él, la columna no se ordena. */
  sortField?: string
  /** Clases extra para la celda y su encabezado (ancho, alineación, `tabular-nums`). */
  className?: string
  /** Columna secundaria: solo se ve si el contenedor de la tabla mide al menos esto. */
  minWidth?: ColumnMinWidth
}

type DataTableProps<T> = {
  /** Descripción de la tabla para lectores de pantalla (no se ve). */
  caption: string
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string | number
  /** Orden actual en formato de la API: "campo,asc" o "campo,desc". */
  sort?: string
  onSortChange?: (sort: string) => void
  /** Datos de la página anterior mientras llega la nueva: se muestran atenuados. */
  isDimmed?: boolean
  /** Qué mostrar si no hay filas (normalmente un EmptyState). */
  empty?: ReactNode
}

function parseSort(sort: string | undefined): { field?: string; direction: SortDirection } {
  const [field, direction] = sort?.split(',') ?? []
  return { field, direction: direction === 'desc' ? 'desc' : 'asc' }
}

// Flecha del orden. Activa: ámbar (es un gráfico, no texto); inactiva: tenue, aparece en hover/foco.
function SortIcon({ direction, active }: { direction: SortDirection; active: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={`size-3.5 shrink-0 transition-opacity ${active ? 'text-accent' : 'text-ink-muted opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'} ${direction === 'desc' ? 'rotate-180' : ''}`}
    >
      <path d="M8 3.5 12.5 9h-9z" fill="currentColor" />
    </svg>
  )
}

// Tabla genérica de registros: encabezado fijo, orden por columna (con aria-sort), filas de 44 px.
// Las columnas secundarias (`minWidth`) se ocultan cuando el contenedor no alcanza, para que en
// escritorio no haya scroll horizontal; si aun así no cabe (móvil), el scroll queda dentro de la tabla.
// No sabe de la API: recibe el orden actual y avisa al padre con onSortChange.
export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowId,
  sort,
  onSortChange,
  isDimmed = false,
  empty,
}: DataTableProps<T>) {
  const current = parseSort(sort)

  function handleSort(field: string) {
    // Primer clic: ascendente; sobre la columna ya ordenada, alterna la dirección.
    const direction = current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
    onSortChange?.(`${field},${direction}`)
  }

  return (
    <div className="@container max-h-[70vh] overflow-auto rounded-panel border border-line bg-surface">
      <table
        aria-busy={isDimmed || undefined}
        className={`w-full border-collapse text-left text-sm leading-[1.35] transition-opacity ${isDimmed ? 'opacity-60' : ''}`}
      >
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 z-10 bg-surface">
          <tr className="border-b border-line">
            {columns.map((column) => {
              const isActive = column.sortField !== undefined && column.sortField === current.field
              const visibility = column.minWidth ? VISIBLE_FROM[column.minWidth] : ''
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={isActive ? (current.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                  className={`h-11 px-3 font-medium whitespace-nowrap text-ink-muted ${visibility} ${column.className ?? ''}`}
                >
                  {column.sortField && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column.sortField!)}
                      className={`group inline-flex items-center gap-1 rounded-control py-1 hover:text-ink ${isActive ? 'text-ink' : ''}`}
                    >
                      {column.header}
                      <SortIcon direction={isActive ? current.direction : 'asc'} active={isActive} />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && empty ? (
            <tr>
              <td colSpan={columns.length} className="p-4">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getRowId(row)} className="h-11 border-b border-line last:border-b-0 hover:bg-canvas">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-3 py-2 whitespace-nowrap text-ink ${column.minWidth ? VISIBLE_FROM[column.minWidth] : ''} ${column.className ?? ''}`}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
