import { useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router'
import { z } from 'zod'

type ListFilters = { page: number; search: string }

export type UrlFiltersConfig<T extends ListFilters> = {
  /**
   * Campos de texto: se escriben letra a letra. El primer cambio agrega una entrada al historial
   * (atrás vuelve a lo que había antes de escribir) y los siguientes la reemplazan (atrás no
   * recorre "a", "an", "ana"). El resto de los cambios siempre agrega una entrada.
   */
  textFields: readonly (keyof T)[]
  /** Valores que deja "Limpiar filtros" (búsqueda y sidebar); tamaño y orden se conservan. */
  cleared: Partial<T>
  /** Filtros activos del sidebar, para el contador. La búsqueda no cuenta: se ve en su caja. */
  countActive: (filters: T) => number
}

// Marca en history.state las entradas creadas al escribir.
const textEditStateSchema = z.object({ textEdit: z.literal(true) })

// Filtros, orden, tamaño y página de un listado, con la URL como única fuente de verdad: un
// enlace copiado reproduce el resultado y el botón atrás restaura el anterior. Cada listado
// aporta su esquema (con .catch() en cada campo) y su configuración, definida fuera del componente.
export function useUrlFilters<T extends ListFilters>(schema: z.ZodType<T>, config: UrlFiltersConfig<T>) {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  // Un parámetro inválido o ausente cae a su valor por defecto (el .catch() de cada campo).
  const filters = useMemo(() => schema.parse(Object.fromEntries(searchParams)), [schema, searchParams])

  // Los valores por defecto no se escriben en la URL: /customers en vez de
  // /customers?page=1&size=10&sort=id,asc.
  function toSearchParams(next: T): URLSearchParams {
    const defaults = schema.parse({})
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined || value === '' || value === defaults[key as keyof T]) continue
      params.set(key, String(value))
    }
    return params
  }

  // Cambia uno o más campos. Cualquier cambio que no sea de página vuelve a la página 1
  // (otro filtro, tamaño u orden cambian el resultado y la página actual deja de tener sentido).
  function setFilters(patch: Partial<T>) {
    const keys = Object.keys(patch) as (keyof T)[]
    const page = 'page' in patch ? (patch.page ?? 1) : 1
    const isTextEdit = keys.length > 0 && keys.every((key) => config.textFields.includes(key))
    const replace = isTextEdit && textEditStateSchema.safeParse(location.state).success
    setSearchParams(toSearchParams({ ...filters, ...patch, page }), {
      replace,
      state: isTextEdit ? { textEdit: true } : undefined,
    })
  }

  // Cambia en cada "Limpiar filtros". La página lo usa como `key` de los campos de filtro y del
  // buscador: al remontarse descartan lo que se estaba escribiendo y su debounce pendiente
  // (si no, un texto aún sin aplicar se aplicaría después de limpiar).
  const [resetKey, setResetKey] = useState(0)

  function clearFilters() {
    setSearchParams(toSearchParams({ ...filters, ...config.cleared, page: 1 }))
    setResetKey((key) => key + 1)
  }

  const activeCount = config.countActive(filters)
  const hasFilters = activeCount > 0 || filters.search !== ''

  return { filters, setFilters, clearFilters, activeCount, hasFilters, resetKey }
}
