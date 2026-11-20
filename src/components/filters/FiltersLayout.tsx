import type { ReactNode } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery.ts'
import { FiltersDrawer } from './FiltersDrawer.tsx'
import { FiltersSidebar, type FiltersPanelProps } from './FiltersSidebar.tsx'

type FiltersLayoutProps = Omit<FiltersPanelProps, 'children'> & {
  /** Campos de filtro de la página. */
  filters: ReactNode
  /** Contenido principal (tabla, paginación...). */
  children: ReactNode
}

// Desde lg (64rem, como el breakpoint de Tailwind) los filtros van en el sidebar izquierdo;
// en pantallas chicas, en un cajón. Se renderiza solo uno de los dos para no duplicar campos.
const DESKTOP_QUERY = '(min-width: 64rem)'

export function FiltersLayout({ filters, activeCount, onClear, children }: FiltersLayoutProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  if (!isDesktop) {
    return (
      <div>
        <FiltersDrawer activeCount={activeCount} onClear={onClear}>
          {filters}
        </FiltersDrawer>
        {children}
      </div>
    )
  }

  return (
    <div className="flex items-start gap-6">
      <FiltersSidebar activeCount={activeCount} onClear={onClear}>
        {filters}
      </FiltersSidebar>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
