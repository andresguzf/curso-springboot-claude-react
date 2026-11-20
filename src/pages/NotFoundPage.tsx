import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section className="space-y-4 text-center">
      <h1 className="text-3xl font-semibold">Página no encontrada</h1>
      <p className="text-ink-muted">La ruta que buscas no existe.</p>
      <Link to="/" className="inline-block text-sm font-medium text-accent-strong underline">
        Volver al inicio
      </Link>
    </section>
  )
}
