// Formatos de fecha para mostrar en la interfaz (es-CL: día-mes-año).

const EMPTY = '—'

// LocalDate de la API ("1990-05-20") → "20-05-1990".
// Sin `new Date()`: un string solo con fecha se interpreta como medianoche UTC y, al mostrarlo
// en Chile (UTC-3 / UTC-4), saldría el día anterior. Basta con reordenar las partes.
export function formatDate(value: string | null | undefined): string {
  if (!value) return EMPTY
  const [year, month, day] = value.split('-')
  return `${day}-${month}-${year}`
}

// LocalDateTime de la API ("2026-11-19T10:15:30.123") → solo el día, "19-11-2026" (tablas: la hora
// rara vez decide algo en un listado; la ficha la conserva). Sin `new Date()`, como formatDate.
export function formatDay(value: string | null | undefined): string {
  return formatDate(value?.slice(0, 10))
}

const dateTimeFormat = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

// LocalDateTime de la API ("2026-11-19T10:15:30.123") → "19-11-2026, 10:15".
// Aquí sí sirve `new Date()`: una fecha con hora y sin zona se interpreta en hora local, y se
// formatea en hora local, así que se muestra la misma hora que guardó el servidor.
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return EMPTY
  return dateTimeFormat.format(new Date(value))
}

// Montos en pesos chilenos: "$ 178.500". Hasta 2 decimales solo si los hay ("$ 33,33"): las columnas
// admiten decimales aunque el peso no los use.
const moneyFormat = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatMoney(value: number): string {
  return moneyFormat.format(value)
}

// Cantidades de una línea: "20", "1,5".
const quantityFormat = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 })

export function formatQuantity(value: number): string {
  return quantityFormat.format(value)
}
