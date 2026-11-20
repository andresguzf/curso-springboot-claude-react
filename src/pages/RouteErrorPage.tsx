import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'

// errorElement del router: un error inesperado al renderizar una ruta. Se muestra sin layout
// (el error pudo venir del propio layout) y con una salida clara.
export function RouteErrorPage() {
  useDocumentTitle('Algo salió mal')
  const error = useRouteError()
  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : undefined

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="max-w-md space-y-4 text-center">
        <h1 className="text-3xl font-semibold">Algo salió mal</h1>
        <p className="text-ink-muted">
          La pantalla no se pudo mostrar. Vuelve al inicio o recarga la página; si el problema sigue, avisa al equipo
          de soporte.
        </p>
        {detail && <p className="rounded-control bg-surface px-3 py-2 text-left text-sm text-ink-muted">{detail}</p>}
        <Link to="/" reloadDocument className="inline-block text-sm font-medium text-accent-strong underline">
          Volver al inicio
        </Link>
      </section>
    </main>
  )
}
