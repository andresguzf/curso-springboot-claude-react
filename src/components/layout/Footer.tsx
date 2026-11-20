// Calculado una vez al cargar el módulo: `new Date()` dentro del render haría
// el componente impuro (distinto resultado en cada render).
const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm text-slate-500">
        © {CURRENT_YEAR} 4-react
      </div>
    </footer>
  )
}
