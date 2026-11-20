import { useId } from 'react'
import { useDebouncedText } from '../../hooks/useDebouncedText.ts'
import { Input } from '../ui/Input.tsx'

type SearchFieldProps = {
  /** Etiqueta para lectores de pantalla ("Buscar clientes"). */
  label: string
  placeholder: string
  /** Búsqueda aplicada (la de la URL). */
  value: string
  onSearch: (text: string) => void
}

// Buscador de un listado: aplica el texto tras una pausa al escribir (debounce en el handler),
// no con una petición por tecla. La página le pone key={resetKey} para "Limpiar filtros".
export function SearchField({ label, placeholder, value, onSearch }: SearchFieldProps) {
  const id = useId()
  const search = useDebouncedText(value, onSearch)

  return (
    <div className="w-full max-w-md">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Input
        id={id}
        type="search"
        value={search.text}
        onChange={(event) => search.onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  )
}
