import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { statsFiltersSchema, type StatsFilters } from '../schemas/invoice.ts'

// Filtros del resumen (cliente y rango de emisión, spec 12) con la URL como única fuente de verdad,
// como los listados: un enlace copiado reproduce el resumen filtrado y el botón atrás vuelve al filtro
// anterior. No usa useUrlFilters porque ese hook supone la página y la búsqueda de un listado.
export function useStatsFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Un parámetro inválido cae a undefined; un rango invertido se descarta (ver statsFiltersSchema).
  const filters = useMemo(() => statsFiltersSchema.parse(Object.fromEntries(searchParams)), [searchParams])

  // Solo se escriben los filtros con valor: sin filtros, la URL queda limpia ("/").
  function write(next: StatsFilters) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(next)) {
      if (value !== undefined) params.set(key, String(value))
    }
    setSearchParams(params)
  }

  // Cambia uno o más filtros (cada cambio es una entrada del historial: "atrás" lo deshace).
  function setFilters(patch: Partial<StatsFilters>) {
    write({ ...filters, ...patch })
  }

  // Cambia en cada "Limpiar filtros": la barra lo usa como key de sus campos, que al remontarse
  // descartan lo que se estaba escribiendo (texto del autocompletado, fechas a medio escribir).
  const [resetKey, setResetKey] = useState(0)

  function clearFilters() {
    write({})
    setResetKey((key) => key + 1)
  }

  const hasFilters = Object.values(filters).some((value) => value !== undefined)

  return { filters, setFilters, clearFilters, hasFilters, resetKey }
}
