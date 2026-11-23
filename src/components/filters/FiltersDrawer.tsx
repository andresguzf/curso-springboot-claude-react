import { useId, useRef, useState, type SyntheticEvent } from 'react'
import { useModalDialog } from '../../hooks/useModalDialog.ts'
import { Button } from '../ui/Button.tsx'
import type { FiltersPanelProps } from './FiltersSidebar.tsx'

// Filtros en pantallas chicas: un botón "Filtros (n)" abre un cajón lateral (<dialog> modal)
// sobre el contenido. Los filtros se aplican al momento; "Ver resultados" solo cierra el cajón.
export function FiltersDrawer({ activeCount = 0, onClear, children }: FiltersPanelProps) {
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useModalDialog(open, closeRef)
  const titleId = useId()
  const countLabel = activeCount > 0 ? ` (${activeCount})` : ''

  // Esc cierra el cajón; el estado local sigue siendo la única fuente de verdad.
  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault()
    setOpen(false)
  }

  return (
    <>
      <div className="mb-4">
        <Button onClick={() => setOpen(true)} aria-haspopup="dialog">
          Filtros<span className="text-accent-strong">{countLabel}</span>
        </Button>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onCancel={handleCancel}
        className="m-0 h-dvh max-h-dvh w-[min(20rem,85vw)] max-w-none border-r border-line bg-surface text-ink backdrop:bg-scrim/40"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
            <h2 id={titleId} className="text-[0.9375rem] font-semibold">
              Filtros<span className="font-medium text-accent-strong">{countLabel}</span>
            </h2>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar filtros"
              className="rounded-control p-1 text-ink-muted hover:bg-canvas hover:text-ink"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">{children}</div>
          <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-3">
            {onClear && activeCount > 0 ? (
              <Button variant="ghost" onClick={onClear}>
                Limpiar filtros
              </Button>
            ) : (
              <span />
            )}
            <Button variant="primary" onClick={() => setOpen(false)}>
              Ver resultados
            </Button>
          </div>
        </div>
      </dialog>
    </>
  )
}
