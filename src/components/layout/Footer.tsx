// Calculado una vez al cargar el módulo: `new Date()` dentro del render haría
// el componente impuro (distinto resultado en cada render).
const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm text-ink-muted">
        © {CURRENT_YEAR} Cartera
      </div>
    </footer>
  )
}
