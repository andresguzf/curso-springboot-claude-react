import { SearchField } from '../filters/SearchField.tsx'

type CustomerSearchProps = {
  /** Búsqueda aplicada (la de la URL). */
  value: string
  onSearch: (text: string) => void
}

// Buscador del listado de clientes: nombre, apellido, email y ciudad.
export function CustomerSearch({ value, onSearch }: CustomerSearchProps) {
  return (
    <SearchField
      label="Buscar clientes"
      placeholder="Buscar por nombre, apellido, email o ciudad"
      value={value}
      onSearch={onSearch}
    />
  )
}
