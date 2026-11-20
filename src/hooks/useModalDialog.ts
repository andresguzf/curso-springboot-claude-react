import { useEffect, useRef, type RefObject } from 'react'

// Sincroniza un booleano `open` con un <dialog> nativo abierto con showModal() (fondo inerte,
// foco atrapado). El <dialog> es un sistema externo a React, por eso es un effect.
// Se compara con dialog.open para tolerar el doble montaje de StrictMode.
// Lo usan ConfirmDialog y el cajón de filtros en móvil.
export function useModalDialog(open: boolean, initialFocus?: RefObject<HTMLElement | null>) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      initialFocus?.current?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open, initialFocus])

  return dialogRef
}
