import { STATUS_LABELS, type InvoiceStatus } from '../../schemas/invoice.ts'
import { Badge } from '../ui/Badge.tsx'

// Pendiente (cobre/miel, requiere atención), pagada (verde) y anulada (neutro: ya no cuenta).
const TONES = { PENDING: 'warning', PAID: 'success', CANCELLED: 'neutral' } as const

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge tone={TONES[status]}>{STATUS_LABELS[status]}</Badge>
}
