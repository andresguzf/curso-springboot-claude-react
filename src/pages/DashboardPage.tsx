import type { UseQueryResult } from '@tanstack/react-query'
import { ShieldUser, UserCheck, UserPlus, Users, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '../components/ui/Button.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { useAuth } from '../hooks/useAuth.ts'
import { useDashboardStats } from '../hooks/useDashboardStats.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'

const numberFormat = new Intl.NumberFormat('es-CL')

type StatRowProps = {
  to: string
  label: string
  detail: string
  /** Icono que identifica la cifra (decorativo: el texto ya la nombra). */
  icon: LucideIcon
  stat: UseQueryResult<number>
}

// Una fila del fichero: qué se cuenta, el total y un dato de contexto. Toda la fila enlaza al
// listado con ese filtro aplicado (el mismo resultado que cuenta la cifra).
function StatRow({ to, label, detail, icon: Icon, stat }: StatRowProps) {
  const value = stat.isPending ? '…' : stat.isError ? '—' : numberFormat.format(stat.data)
  return (
    <li>
      <Link
        to={to}
        className="flex items-center justify-between gap-6 px-5 py-4 transition-colors hover:bg-canvas sm:px-6"
      >
        <span className="flex min-w-0 items-center gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-control bg-accent-soft text-accent-strong">
            <Icon aria-hidden="true" size={20} strokeWidth={1.75} />
          </span>
          <span className="min-w-0">
            <span className="block text-[0.9375rem] font-medium text-ink">{label}</span>
            <span className="block text-sm text-ink-muted">{detail}</span>
          </span>
        </span>
        <span
          className="text-[1.75rem] leading-none font-semibold text-ink tabular-nums"
          aria-busy={stat.isPending || undefined}
        >
          {value}
        </span>
      </Link>
    </li>
  )
}

// Página de inicio: la cartera en cuatro cifras, cada una como puerta al listado filtrado.
export function DashboardPage() {
  useDocumentTitle('Resumen')
  const { isAdmin } = useAuth()
  const { month, customers, active, newThisMonth, users } = useDashboardStats({ includeUsers: isAdmin })
  const rows = [customers, active, newThisMonth, ...(isAdmin ? [users] : [])]
  const failed = rows.filter((stat) => stat.isError)

  const totalCustomers = customers.data
  const activeDetail = totalCustomers === undefined ? 'Clientes con estado activo' : `De ${numberFormat.format(totalCustomers)} clientes`

  return (
    <>
      <PageHeader title="Resumen" description="La cartera de clientes al día de hoy. Cada cifra abre el listado correspondiente." />

      <ul className="max-w-3xl divide-y divide-line rounded-panel border border-line bg-surface">
        <StatRow to="/customers" label="Clientes en la cartera" detail="Todos los registros" icon={Users} stat={customers} />
        <StatRow to="/customers?active=true" label="Clientes activos" detail={activeDetail} icon={UserCheck} stat={active} />
        <StatRow
          to={`/customers?createdFrom=${month.start}`}
          label={`Clientes dados de alta en ${month.name}`}
          detail={`Desde el 1 de ${month.name}`}
          icon={UserPlus}
          stat={newThisMonth}
        />
        {isAdmin && <StatRow to="/users" label="Usuarios con acceso" detail="Administradores y usuarios" icon={ShieldUser} stat={users} />}
      </ul>

      {failed.length > 0 && (
        <div role="alert" className="mt-4 flex max-w-3xl flex-wrap items-center justify-between gap-3 text-sm text-danger">
          <p>No se pudieron cargar algunas cifras.</p>
          <Button size="sm" onClick={() => failed.forEach((stat) => stat.refetch())}>
            Reintentar
          </Button>
        </div>
      )}
    </>
  )
}
