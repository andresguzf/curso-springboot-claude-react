import { Link } from 'react-router'
import { formatMoney } from '../../lib/format.ts'
import type { InvoiceStats } from '../../schemas/invoice.ts'

type TopCustomersProps = {
  customers: InvoiceStats['topCustomers']
}

// Ranking de los clientes con más facturado (sin anuladas). Es un orden real, por eso va numerado
// (lista ordenada); la barra muestra cada monto en proporción al primero. Cada cliente abre su
// listado de facturas.
export function TopCustomers({ customers }: TopCustomersProps) {
  const max = customers[0]?.total ?? 0

  return (
    <section aria-labelledby="top-customers">
      <h3 id="top-customers" className="mb-2 text-sm font-semibold text-ink">
        Clientes con más facturado
      </h3>
      <ol className="space-y-1">
        {customers.map((customer, index) => (
          <li key={customer.customerId}>
            <Link
              to={`/invoices?customerId=${customer.customerId}`}
              className="grid grid-cols-[1.25rem_minmax(0,9rem)_1fr_auto] items-center gap-x-3 rounded-control px-1 py-1.5 text-sm hover:bg-canvas sm:grid-cols-[1.25rem_minmax(0,12rem)_1fr_auto_6rem]"
            >
              <span className="text-ink-muted tabular-nums">{index + 1}</span>
              <span className="truncate text-ink">{customer.customerName}</span>
              <span aria-hidden="true" className="h-2 rounded-[2px] bg-canvas">
                <span
                  className="block h-full rounded-[2px] bg-ink-muted"
                  style={{ width: `${max > 0 ? (customer.total / max) * 100 : 0}%` }}
                />
              </span>
              <span className="text-right font-semibold text-ink tabular-nums">{formatMoney(customer.total)}</span>
              <span className="hidden text-ink-muted sm:block">
                {customer.invoiceCount} {customer.invoiceCount === 1 ? 'factura' : 'facturas'}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
