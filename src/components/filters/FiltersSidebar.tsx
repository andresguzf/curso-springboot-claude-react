import { useId, type ReactNode } from 'react'
import { useUiStore } from '../../stores/uiStore.ts'

export type FiltersPanelProps = {
  /** Cantidad de filtros aplicados (se muestra junto al título y en el botón colapsado). */
  activeCount?: number
  /** Si existe, se muestra "Limpiar filtros" cuando hay alguno aplicado. */
  onClear?: () => void
  /** Los campos de filtro de cada página. */
  children: ReactNode
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
      <path
        d={collapsed ? 'm9 6 6 6-6 6' : 'm15 6-6 6 6 6'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Cajón de filtros a la izquierda (escritorio). Se colapsa para dejar todo el ancho a la tabla;
// el estado vive en uiStore (persistido), así se mantiene al recargar. Los campos siguen montados
// aunque esté colapsado (atributo hidden), para no perder lo que el usuario escribió.
export function FiltersSidebar({ activeCount = 0, onClear, children }: FiltersPanelProps) {
  const open = useUiStore((state) => state.filtersOpen)
  const toggle = useUiStore((state) => state.toggleFilters)
  const panelId = useId()
  const countLabel = activeCount > 0 ? ` (${activeCount})` : ''

  return (
    <aside
      aria-label="Filtros"
      className={`shrink-0 self-start rounded-panel border border-line bg-surface ${open ? 'w-64' : 'w-12'}`}
    >
      {/* Un solo botón que no se desmonta al colapsar/expandir: así el foco del teclado no se pierde. */}
      <div className={open ? 'flex items-center justify-between gap-2 border-b border-line px-4 py-3' : undefined}>
        {open && (
          <h2 className="text-[0.9375rem] font-semibold">
            Filtros<span className="font-medium text-accent-strong">{countLabel}</span>
          </h2>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? 'Ocultar filtros' : `Mostrar filtros${activeCount > 0 ? `, ${activeCount} aplicados` : ''}`}
          className={
            open
              ? 'rounded-control p-1 text-ink-muted hover:bg-canvas hover:text-ink'
              : 'flex w-full flex-col items-center gap-2 rounded-panel py-3 text-ink-muted hover:bg-canvas hover:text-ink'
          }
        >
          <CollapseIcon collapsed={!open} />
          {!open && <span className="text-sm font-medium [writing-mode:vertical-rl]">Filtros</span>}
          {!open && activeCount > 0 && <span className="text-sm font-semibold text-accent-strong">{activeCount}</span>}
        </button>
      </div>

      <div id={panelId} hidden={!open} className="space-y-5 px-4 py-4">
        {children}
        {onClear && activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-medium text-accent-strong underline underline-offset-2 hover:text-ink"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </aside>
  )
}
