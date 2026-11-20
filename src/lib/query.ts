type QueryValue = string | number | boolean | null | undefined
export type QueryParams = Record<string, QueryValue | readonly QueryValue[]>

const isEmpty = (value: QueryValue): value is null | undefined | '' =>
  value === null || value === undefined || value === ''

// Arma el query string ("?a=1&b=2") omitiendo los valores vacíos, así un filtro sin valor
// no viaja como "?search=". Un arreglo repite la clave: { sort: ['lastName,desc', 'id,asc'] }.
// Devuelve '' si no queda ningún parámetro.
export function toQuery(params: QueryParams): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    const values: readonly QueryValue[] = Array.isArray(value) ? value : [value as QueryValue]
    for (const item of values) {
      if (!isEmpty(item)) search.append(key, String(item))
    }
  }
  const query = search.toString()
  return query === '' ? '' : `?${query}`
}
