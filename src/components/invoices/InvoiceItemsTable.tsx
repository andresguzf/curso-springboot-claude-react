import { formatMoney, formatQuantity } from '../../lib/format.ts'
import type { InvoiceItem } from '../../schemas/invoice.ts'

type InvoiceItemsTableProps = {
  items: InvoiceItem[]
}

// Líneas de una factura (solo lectura). Una tabla simple, sin orden ni paginación: la factura trae
// todas sus líneas en el orden de lineNumber. Con poco ancho, la tabla se desplaza dentro de su
// contenedor (la descripción es larga y los montos no se cortan).
export function InvoiceItemsTable({ items }: InvoiceItemsTableProps) {
  return (
    <div className="overflow-x-auto rounded-panel border border-line bg-surface">
      <table className="w-full text-sm">
        <caption className="sr-only">Líneas de la factura</caption>
        <thead className="border-b border-line text-left text-ink-muted">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">
              <abbr title="Número de línea" className="no-underline">
                N.º
              </abbr>
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Descripción
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Cantidad
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium whitespace-nowrap">
              Precio unitario
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((item) => (
            <tr key={item.lineNumber}>
              <td className="px-3 py-2 text-ink-muted tabular-nums">{item.lineNumber}</td>
              <td className="min-w-48 px-3 py-2 text-ink">{item.description}</td>
              <td className="px-3 py-2 text-right text-ink tabular-nums">{formatQuantity(item.quantity)}</td>
              <td className="px-3 py-2 text-right whitespace-nowrap text-ink tabular-nums">
                {formatMoney(item.unitPrice)}
              </td>
              <td className="px-3 py-2 text-right whitespace-nowrap text-ink tabular-nums">
                {formatMoney(item.lineTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
