import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useId, useState, type KeyboardEvent, type Ref } from 'react'
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback.ts'
import { customerKeys } from '../../hooks/useCustomers.ts'
import { customerFiltersSchema, type Customer, type CustomerFilters } from '../../schemas/customer.ts'
import { customerService } from '../../services/customerService.ts'
import type { FieldControlProps } from '../ui/FormField.tsx'
import { Input } from '../ui/Input.tsx'
import { Spinner } from '../ui/Spinner.tsx'

const MAX_OPTIONS = 8

// Búsqueda de clientes: la del listado (nombre, apellido, email o ciudad), 8 por página, por apellido.
const searchFilters = (search: string): CustomerFilters => ({
  ...customerFiltersSchema.parse({}),
  search,
  size: MAX_OPTIONS,
  sort: 'lastName,asc',
})

type CustomerComboboxProps = {
  /** Atributos de FormField (id, aria-describedby, aria-invalid) para el input. */
  field: FieldControlProps
  /** Avisa el cliente elegido (o null al cambiarlo). El formulario guarda solo su id. */
  onSelect: (customer: Customer | null) => void
  /** React Hook Form: marca el campo como tocado al salir. */
  onBlur?: () => void
  /** React Hook Form (Controller): enfoca el campo cuando es el primero con error al enviar. */
  inputRef?: Ref<HTMLInputElement>
}

// Campo «Cliente» con autocompletado (spec 11), según el patrón combobox de ARIA: el input tiene
// role="combobox" y la lista role="listbox"; la opción activa se anuncia con aria-activedescendant
// (el foco se queda en el input). Busca en la API con una pausa al escribir. Teclado: ↑ ↓ mueven,
// Enter elige, Esc cierra. Con el puntero, onMouseDown + preventDefault evita que el blur del input
// cierre la lista antes del clic.
export function CustomerCombobox({ field, onSelect, onBlur, inputRef }: CustomerComboboxProps) {
  const listboxId = useId()
  const [selected, setSelected] = useState<Customer | null>(null)
  const [text, setText] = useState('')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  // Tras «Cambiar», el campo de búsqueda vuelve a aparecer y recibe el foco (autoFocus en ese render).
  const [focusSearch, setFocusSearch] = useState(false)

  const applyQuery = useDebouncedCallback((next: string) => {
    setQuery(next)
    setActiveIndex(-1)
  }, 300)

  const results = useQuery({
    queryKey: customerKeys.list(searchFilters(query)),
    queryFn: () => customerService.page(searchFilters(query)),
    enabled: query !== '',
    placeholderData: keepPreviousData,
  })
  const options = query === '' ? [] : (results.data?.content ?? [])
  const showList = open && query !== ''
  const optionId = (customer: Customer) => `${listboxId}-${customer.id}`

  function choose(customer: Customer) {
    setSelected(customer)
    setOpen(false)
    onSelect(customer)
  }

  function change() {
    setSelected(null)
    setText('')
    setQuery('')
    onSelect(null)
    setFocusSearch(true)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((index) => Math.min(index + 1, options.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter' && showList && activeIndex >= 0 && options[activeIndex]) {
      // Enter elige la opción activa en vez de enviar el formulario.
      event.preventDefault()
      choose(options[activeIndex])
    } else if (event.key === 'Escape' && showList) {
      event.preventDefault()
      setOpen(false)
    }
  }

  if (selected) {
    return (
      <div className="flex items-center gap-3">
        {/* Solo lectura: mantiene la etiqueta «Cliente» asociada y muestra a quién se eligió. */}
        <Input {...field} readOnly value={`${selected.name} ${selected.lastName} · ${selected.email}`} className="bg-canvas" />
        <button
          type="button"
          onClick={change}
          className="shrink-0 text-sm font-medium text-accent-strong underline underline-offset-2 hover:text-ink"
        >
          Cambiar
          <span className="sr-only"> de cliente</span>
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <Input
        {...field}
        ref={inputRef}
        autoFocus={focusSearch}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={showList && options[activeIndex] ? optionId(options[activeIndex]) : undefined}
        autoComplete="off"
        placeholder="Busca por nombre, apellido o email"
        value={text}
        onChange={(event) => {
          setText(event.target.value)
          setOpen(true)
          applyQuery.run(event.target.value.trim())
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setOpen(false)
          onBlur?.()
        }}
        onKeyDown={handleKeyDown}
      />

      <ul
        id={listboxId}
        role="listbox"
        aria-label="Clientes encontrados"
        hidden={!showList}
        className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-auto rounded-control border border-line bg-surface py-1 shadow-popover"
      >
        {options.map((customer, index) => (
          <li
            key={customer.id}
            id={optionId(customer)}
            role="option"
            aria-selected={index === activeIndex}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => choose(customer)}
            onMouseMove={() => setActiveIndex(index)}
            className={`cursor-pointer px-3 py-2 text-sm ${index === activeIndex ? 'bg-accent-soft text-ink' : 'text-ink'}`}
          >
            <span className="font-medium">
              {customer.name} {customer.lastName}
            </span>
            {!customer.active && <span className="text-ink-muted"> (inactivo)</span>}
            <span className="block truncate text-ink-muted">{customer.email}</span>
          </li>
        ))}
        {showList && results.isFetching && options.length === 0 && (
          <li role="presentation" className="flex items-center gap-2 px-3 py-2 text-sm text-ink-muted">
            <Spinner className="size-4" /> Buscando…
          </li>
        )}
        {showList && !results.isFetching && results.isSuccess && options.length === 0 && (
          <li role="presentation" className="px-3 py-2 text-sm text-ink-muted">
            Sin clientes con ese texto
          </li>
        )}
        {showList && results.isError && (
          <li role="presentation" className="px-3 py-2 text-sm text-danger">
            No se pudo buscar. Sigue escribiendo para reintentar.
          </li>
        )}
      </ul>

      {/* Anuncia a los lectores de pantalla cuántos resultados hay (la lista no recibe el foco). */}
      <p className="sr-only" aria-live="polite">
        {showList && results.isSuccess ? `${options.length} ${options.length === 1 ? 'cliente' : 'clientes'}` : ''}
      </p>
    </div>
  )
}
