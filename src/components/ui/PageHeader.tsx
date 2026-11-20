import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'

type PageHeaderProps = {
  title: string
  description?: string
  /** Acciones de la página (p. ej. Exportar, Nuevo cliente), alineadas a la derecha. */
  actions?: ReactNode
}

// Encabezado de cada página: el único h1 y la única tipografía grande de la pantalla.
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const { pathname, key } = useLocation()

  // Al llegar a otra pantalla, el foco va al h1: un lector de pantalla anuncia la página nueva y
  // el teclado sigue desde arriba. Cuenta como "llegar" montarse tras una navegación (en la carga
  // inicial, key es "default") o que cambie la ruta (pathname). Cambiar filtros u orden (solo el
  // query string) no cuenta: no debe sacar el foco del buscador.
  const [focusRequests, setFocusRequests] = useState(key === 'default' ? 0 : 1)
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setFocusRequests((count) => count + 1)
  }

  useEffect(() => {
    if (focusRequests > 0) headingRef.current?.focus()
  }, [focusRequests])

  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 ref={headingRef} tabIndex={-1} className="text-[1.75rem] leading-tight font-semibold text-ink focus:outline-none">
          {title}
        </h1>
        {description && <p className="mt-1 max-w-prose text-[0.9375rem] text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
