import { useId } from 'react'
import { useDebouncedText } from '../../hooks/useDebouncedText.ts'
import { Input } from '../ui/Input.tsx'

type CustomerSearchProps = {
  /** Búsqueda aplicada (la de la URL). */
  value: string
  onSearch: (text: string) => void
}

// Buscador del listado: filtra por nombre, apellido, email y ciudad tras una pausa al escribir
// (debounce en el handler), no con una petición por tecla.
export function CustomerSearch({ value, onSearch }: CustomerSearchProps) {
  const id = useId()
  const search = useDebouncedText(value, onSearch)

  return (
    <div className="w-full max-w-md">
      <label htmlFor={id} className="sr-only">
        Buscar clientes
      </label>
      <Input
        id={id}
        type="search"
        value={search.text}
        onChange={(event) => search.onChange(event.target.value)}
        placeholder="Buscar por nombre, apellido, email o ciudad"
        autoComplete="off"
      />
    </div>
  )
}
