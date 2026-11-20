import { Link } from 'react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'

// Destino de RequireRole: el usuario tiene sesión, pero su rol no permite abrir esa sección.
export function ForbiddenPage() {
  useDocumentTitle('Sin permiso')
  return (
    <section className="space-y-4 py-10 text-center">
      <h1 className="text-3xl font-semibold">Sin permiso</h1>
      <p className="mx-auto max-w-prose text-ink-muted">
        Tu rol no permite abrir esta sección. Si necesitas acceso, pídeselo a un administrador.
      </p>
      <Link to="/" className="inline-block text-sm font-medium text-accent-strong underline">
        Volver al inicio
      </Link>
    </section>
  )
}
