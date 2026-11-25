// Fecha de hoy en hora local (yyyy-MM-dd). Sin toISOString(): devuelve la fecha en UTC y, en Chile
// de noche, ya sería mañana. Llámala al validar o en un inicializador, no durante el render.
export function todayIsoDate(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
