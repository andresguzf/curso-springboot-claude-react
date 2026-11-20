import { useId, useRef, type ReactNode, type SyntheticEvent } from 'react'
import { useModalDialog } from '../../hooks/useModalDialog.ts'
import { Button } from './Button.tsx'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: ReactNode
  /** Verbo de la acción ("Eliminar", "Cambiar a Usuario"); por defecto "Confirmar". */
  confirmLabel?: string
  cancelLabel?: string
  /** "danger" pinta el botón de confirmar en granate (eliminar, degradar). */
  tone?: 'default' | 'danger'
  /** La acción está en curso: bloquea los botones y Esc para evitar dobles envíos. */
  isPending?: boolean
  /** Error de la acción (p. ej. el 409 del backend): se muestra dentro del modal sin cerrarlo. */
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}

// Modal de confirmación con <dialog> nativo: showModal() deja el resto de la página inerte,
// atrapa el foco y cierra con Esc. El padre controla `open` con su propio estado;
// el modal no sabe nada de la acción que confirma.
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'default',
  isPending = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  // El foco empieza en Cancelar: la opción segura ante un Enter apresurado.
  const dialogRef = useModalDialog(open, cancelRef)
  const titleId = useId()
  const descriptionId = useId()

  // Esc dispara el evento "cancel" del <dialog>. Se evita el cierre nativo para que el estado
  // del padre siga siendo la única fuente de verdad (el padre pone open=false).
  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault()
    if (!isPending) onCancel()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={handleCancel}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-dialog border border-line bg-surface text-ink shadow-[0_12px_40px_rgb(31_41_51/0.25)] backdrop:bg-ink/40"
    >
      <div className="space-y-3 px-6 pt-6">
        <h2 id={titleId} className="text-xl font-semibold">
          {title}
        </h2>
        <div id={descriptionId} className="text-[0.9375rem] text-ink-muted">
          {description}
        </div>
        {error && (
          <p role="alert" className="rounded-control bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
      </div>
      <div className="flex flex-wrap justify-end gap-2 px-6 pt-5 pb-6">
        <Button ref={cancelRef} onClick={onCancel} disabled={isPending}>
          {cancelLabel}
        </Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} isPending={isPending}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
