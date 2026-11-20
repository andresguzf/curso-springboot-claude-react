import { useMemo } from 'react'
import { useLocation, useSearchParams } from 'react-router'
import { z } from 'zod'
import { customerFiltersSchema, type CustomerFilters } from '../schemas/customer.ts'

// Valores por defecto: no se escriben en la URL para que quede corta (/customers en vez de
// /customers?page=1&size=10&sort=id,asc).
const DEFAULTS = customerFiltersSchema.parse({})

// Campos de texto: se escriben letra a letra. El primer cambio agrega una entrada al historial
// (atrás vuelve a lo que había antes de escribir) y los siguientes la reemplazan (atrás no
// recorre "a", "an", "ana"). El resto de los cambios siempre agrega una entrada.
const TEXT_FIELDS: (keyof CustomerFilters)[] = ['search', 'city']

// Marca en history.state las entradas creadas al escribir.
const textEditStateSchema = z.object({ textEdit: z.literal(true) })

const EMPTY_FILTERS: Partial<CustomerFilters> = {
  search: '',
  active: undefined,
  city: '',
  birthFrom: undefined,
  birthTo: undefined,
  createdFrom: undefined,
  createdTo: undefined,
}

function toSearchParams(filters: CustomerFilters): URLSearchParams {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === '' || value === DEFAULTS[key as keyof CustomerFilters]) continue
    params.set(key, String(value))
  }
  return params
}

// Filtros, orden, tamaño y página del listado de clientes, con la URL como única fuente de
// verdad: un enlace copiado reproduce el resultado y el botón atrás restaura el anterior.
export function useCustomerFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  // Cada campo del esquema tiene .catch(): un parámetro inválido cae a su valor por defecto.
  const filters = useMemo(() => customerFiltersSchema.parse(Object.fromEntries(searchParams)), [searchParams])

  // Cambia uno o más campos. Cualquier cambio que no sea de página vuelve a la página 1
  // (otro filtro, tamaño u orden cambian el resultado y la página actual deja de tener sentido).
  function setFilters(patch: Partial<CustomerFilters>) {
    const keys = Object.keys(patch) as (keyof CustomerFilters)[]
    const page = 'page' in patch ? (patch.page ?? 1) : 1
    const isTextEdit = keys.length > 0 && keys.every((key) => TEXT_FIELDS.includes(key))
    const replace = isTextEdit && textEditStateSchema.safeParse(location.state).success
    setSearchParams(toSearchParams({ ...filters, ...patch, page }), {
      replace,
      state: isTextEdit ? { textEdit: true } : undefined,
    })
  }

  // Quita búsqueda y filtros del sidebar; conserva el tamaño de página y el orden.
  function clearFilters() {
    setSearchParams(toSearchParams({ ...filters, ...EMPTY_FILTERS, page: 1 }))
  }

  // Filtros activos del sidebar (cada rango cuenta como uno). La búsqueda no cuenta: se ve en su caja.
  const activeCount = [
    filters.active !== undefined,
    filters.city !== '',
    filters.birthFrom !== undefined || filters.birthTo !== undefined,
    filters.createdFrom !== undefined || filters.createdTo !== undefined,
  ].filter(Boolean).length

  const hasFilters = activeCount > 0 || filters.search !== ''

  return { filters, setFilters, clearFilters, activeCount, hasFilters }
}
