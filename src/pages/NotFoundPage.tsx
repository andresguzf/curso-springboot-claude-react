import { Link } from 'react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'

export function NotFoundPage() {
  useDocumentTitle('Página no encontrada')
  return (
    <section className="space-y-4 py-10 text-center">
      <h1 className="text-3xl font-semibold">Página no encontrada</h1>
      <p className="text-ink-muted">La ruta que buscas no existe. Revisa la dirección o vuelve al inicio.</p>
      <Link to="/" className="inline-block text-sm font-medium text-accent-strong underline">
        Volver al inicio
      </Link>
    </section>
  )
}
