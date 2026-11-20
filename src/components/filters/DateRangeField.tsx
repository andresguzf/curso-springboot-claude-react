import { useId, useState } from 'react'
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback.ts'
import { Input } from '../ui/Input.tsx'

export type DateRange = { from?: string; to?: string }

type DateRangeFieldProps = {
  label: string
  /** Rango aplicado (yyyy-MM-dd), normalmente el de la URL. */
  from?: string
  to?: string
  onChange: (range: DateRange) => void
}

const isInverted = (range: { from: string; to: string }) => range.from !== '' && range.to !== '' && range.from > range.to

// Rango de fechas "desde / hasta" (ambos opcionales). Las fechas yyyy-MM-dd se comparan como texto.
// Solo aplica el rango si es válido; si "desde" es posterior a "hasta", muestra el error y no lo envía.
// Aplica con debounce: en Chrome, escribir el año dígito a dígito dispara un cambio por dígito.
export function DateRangeField({ label, from, to, onChange }: DateRangeFieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const [draft, setDraft] = useState({ from: from ?? '', to: to ?? '' })
  const [prev, setPrev] = useState({ from, to })

  // Si el rango aplicado cambia desde fuera ("Limpiar filtros", botón atrás), los campos lo reflejan.
  if (prev.from !== from || prev.to !== to) {
    setPrev({ from, to })
    setDraft({ from: from ?? '', to: to ?? '' })
  }

  const inverted = isInverted(draft)

  // Usa el borrador más reciente al vencer el timer; no aplica nada si es inválido o no cambió.
  const commit = useDebouncedCallback(() => {
    if (isInverted(draft) || (draft.from === (from ?? '') && draft.to === (to ?? ''))) return
    onChange({ from: draft.from || undefined, to: draft.to || undefined })
  }, 400)

  function handleChange(part: 'from' | 'to', value: string) {
    setDraft((current) => ({ ...current, [part]: value }))
    commit.run()
  }

  const describedBy = inverted ? errorId : undefined

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1.5 text-sm font-medium text-ink">{label}</legend>
      <div className="grid grid-cols-[3.25rem_1fr] items-center gap-x-2 gap-y-2">
        <label htmlFor={`${id}-from`} className="text-[0.8125rem] text-ink-muted">
          Desde
        </label>
        <Input
          id={`${id}-from`}
          type="date"
          value={draft.from}
          max={draft.to || undefined}
          onChange={(event) => handleChange('from', event.target.value)}
          aria-invalid={inverted || undefined}
          aria-describedby={describedBy}
          className="tabular-nums"
        />
        <label htmlFor={`${id}-to`} className="text-[0.8125rem] text-ink-muted">
          Hasta
        </label>
        <Input
          id={`${id}-to`}
          type="date"
          value={draft.to}
          min={draft.from || undefined}
          onChange={(event) => handleChange('to', event.target.value)}
          aria-invalid={inverted || undefined}
          aria-describedby={describedBy}
          className="tabular-nums"
        />
      </div>
      {inverted && (
        <p id={errorId} className="text-[0.8125rem] text-danger">
          La fecha «desde» no puede ser posterior a «hasta».
        </p>
      )}
    </fieldset>
  )
}
