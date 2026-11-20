import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section className="space-y-4 text-center">
      <h1 className="text-3xl font-bold">Página no encontrada</h1>
      <p className="text-slate-600">La ruta que buscas no existe.</p>
      <Link to="/" className="inline-block text-sm font-medium text-slate-900 underline">
        Volver al inicio
      </Link>
    </section>
  )
}
