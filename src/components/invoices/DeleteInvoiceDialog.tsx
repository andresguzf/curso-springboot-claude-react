import { useDeleteInvoice } from '../../hooks/useInvoices.ts'
import { errorMessage } from '../../lib/errors.ts'
import type { Invoice } from '../../schemas/invoice.ts'
import { ConfirmDialog } from '../ui/ConfirmDialog.tsx'

type DeleteInvoiceDialogProps = {
  /** Factura que se está por eliminar (modal abierto) o null (cerrado). */
  invoice: Invoice | null
  onCancel: () => void
  /** Tras eliminar (el flash ya lo publicó el hook): el padre cierra el modal y navega o ajusta la página. */
  onDeleted: (invoice: Invoice) => void
}

// Confirmación para eliminar una factura, compartida por el listado, el detalle y la ficha del
// cliente. Lleva su propia mutación: el padre le pone key={invoice?.id}, así cada apertura empieza
// sin el error de un intento anterior.
export function DeleteInvoiceDialog({ invoice, onCancel, onDeleted }: DeleteInvoiceDialogProps) {
  const deleteInvoice = useDeleteInvoice()

  return (
    <ConfirmDialog
      open={invoice !== null}
      title={invoice ? `¿Eliminar la factura «${invoice.invoiceNumber}»?` : ''}
      description="Se eliminan también sus líneas. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      tone="danger"
      isPending={deleteInvoice.isPending}
      error={
        deleteInvoice.isError
          ? errorMessage(deleteInvoice.error, 'No se pudo eliminar la factura. Inténtalo de nuevo.')
          : null
      }
      onConfirm={() => {
        if (invoice) deleteInvoice.mutate(invoice.id, { onSuccess: () => onDeleted(invoice) })
      }}
      onCancel={onCancel}
    />
  )
}
