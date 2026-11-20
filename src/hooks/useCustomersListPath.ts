import { useLocation } from 'react-router'
import { z } from 'zod'

// El listado deja su query string en location.state ({ listSearch: "?page=2&sort=city,asc" })
// al abrir un detalle, el alta o la edición. El state es `unknown`: se valida.
const listStateSchema = z.object({ listSearch: z.string() })

// Ruta para volver al listado de clientes con los mismos filtros y en la misma página,
// y el state para reenviarlo al navegar a otra pantalla del mismo flujo (detalle → editar).
export function useCustomersListPath() {
  const location = useLocation()
  const parsed = listStateSchema.safeParse(location.state)
  const listSearch = parsed.success ? parsed.data.listSearch : ''
  return { listPath: `/customers${listSearch}`, listState: { listSearch } }
}
