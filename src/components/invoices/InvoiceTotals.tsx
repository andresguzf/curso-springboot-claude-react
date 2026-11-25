import { formatMoney } from '../../lib/format.ts'
import { TAX_RATE, type InvoiceTotals as Totals } from '../../schemas/invoice.ts'

type InvoiceTotalsProps = {
  totals: Totals
  /** Texto de ayuda bajo el total (p. ej. en el formulario: los importes definitivos los calcula el sistema). */
  note?: string
}

const TAX_LABEL = `IVA (${Math.round(TAX_RATE * 100)} %)`

// Resumen de importes de una factura: subtotal, IVA y total. Lo usan el detalle (importes del
// backend) y el formulario (vista previa mientras se escribe).
export function InvoiceTotals({ totals, note }: InvoiceTotalsProps) {
  return (
    <div className="ml-auto w-full max-w-xs">
      <dl className="space-y-1 text-sm tabular-nums">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Subtotal</dt>
          <dd className="text-ink">{formatMoney(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">{TAX_LABEL}</dt>
          <dd className="text-ink">{formatMoney(totals.tax)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-line pt-2 text-[0.9375rem] font-semibold">
          <dt className="text-ink">Total</dt>
          <dd className="text-ink">{formatMoney(totals.total)}</dd>
        </div>
      </dl>
      {note && <p className="mt-2 text-right text-xs text-ink-muted">{note}</p>}
    </div>
  )
}
