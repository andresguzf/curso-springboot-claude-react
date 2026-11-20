import { useLocation } from 'react-router'
import { z } from 'zod'

// Un listado deja su query string en location.state ({ listSearch: "?page=2&sort=city,asc" })
// al abrir una ficha, el alta o la edición. El state es `unknown`: se valida.
const listStateSchema = z.object({ listSearch: z.string() })

// Ruta para volver al listado `base` con los mismos filtros y en la misma página, y el state para
// reenviarlo al navegar a otra pantalla del mismo flujo (ficha → editar).
export function useListPath(base: string) {
  const location = useLocation()
  const parsed = listStateSchema.safeParse(location.state)
  const listSearch = parsed.success ? parsed.data.listSearch : ''
  return { listPath: `${base}${listSearch}`, listState: { listSearch } }
}
