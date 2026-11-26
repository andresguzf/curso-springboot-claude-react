import type { UseQueryResult } from '@tanstack/react-query'
import { ShieldUser, UserCheck, UserPlus, Users, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import { BillingSection } from '../components/dashboard/BillingSection.tsx'
import { Button } from '../components/ui/Button.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { useAuth } from '../hooks/useAuth.ts'
import { useDashboardStats } from '../hooks/useDashboardStats.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { useStatsFilters } from '../hooks/useStatsFilters.ts'

const numberFormat = new Intl.NumberFormat('es-CL')

type StatTileProps = {
  to: string
  label: string
  /** Icono que identifica la cifra (decorativo: el texto ya la nombra). */
  icon: LucideIcon
  stat: UseQueryResult<number>
}

// Una cifra de la cartera: qué se cuenta y el total. Toda la celda enlaza al listado con ese filtro
// aplicado (el mismo resultado que cuenta la cifra).
function StatTile({ to, label, icon: Icon, stat }: StatTileProps) {
  const value = stat.isPending ? '…' : stat.isError ? '—' : numberFormat.format(stat.data)
  return (
    <li>
      <Link to={to} className="flex h-full items-center gap-3 px-5 py-4 transition-colors hover:bg-canvas">
        <span className="grid size-9 shrink-0 place-items-center rounded-control bg-accent-soft text-accent-strong">
          <Icon aria-hidden="true" size={18} strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm text-ink-muted">{label}</span>
          <span className="block text-xl leading-tight font-semibold text-ink tabular-nums" aria-busy={stat.isPending || undefined}>
            {value}
          </span>
        </span>
      </Link>
    </li>
  )
}

// Página de inicio (spec 11): la facturación (balance, gráficos y ranking, con filtros de cliente y
// fechas en la URL, spec 12) y, debajo, la cartera en cuatro cifras, cada una como puerta al listado filtrado.
export function DashboardPage() {
  useDocumentTitle('Resumen')
  const { isAdmin } = useAuth()
  const { month, customers, active, newThisMonth, users } = useDashboardStats({ includeUsers: isAdmin })
  const rows = [customers, active, newThisMonth, ...(isAdmin ? [users] : [])]
  const failed = rows.filter((stat) => stat.isError)
  // Filtros de la sección «Facturación» (cliente y rango de emisión) en la URL; «Cartera» no se filtra.
  const { filters, setFilters, clearFilters, hasFilters, resetKey } = useStatsFilters()

  return (
    <>
      <PageHeader title="Resumen" description="La facturación y la cartera al día de hoy. Cada cifra abre el listado correspondiente." />

      <div className="space-y-6">
        <BillingSection
          canCreate={isAdmin}
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
          hasFilters={hasFilters}
          resetKey={resetKey}
        />

        <section aria-labelledby="portfolio">
          <h2 id="portfolio" className="mb-3 text-[1.25rem] font-semibold text-ink">
            Cartera
          </h2>
          <ul className="grid divide-line overflow-hidden rounded-panel border border-line bg-surface max-sm:divide-y sm:grid-cols-2 sm:[&>li:nth-child(odd)]:border-r sm:[&>li:nth-child(odd)]:border-line lg:flex lg:divide-x [&>li]:flex-1">
            <StatTile to="/customers" label="Clientes" icon={Users} stat={customers} />
            <StatTile to="/customers?active=true" label="Clientes activos" icon={UserCheck} stat={active} />
            <StatTile to={`/customers?createdFrom=${month.start}`} label={`Nuevos en ${month.name}`} icon={UserPlus} stat={newThisMonth} />
            {isAdmin && <StatTile to="/users" label="Usuarios con acceso" icon={ShieldUser} stat={users} />}
          </ul>

          {failed.length > 0 && (
            <div role="alert" className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-danger">
              <p>No se pudieron cargar algunas cifras.</p>
              <Button size="sm" onClick={() => failed.forEach((stat) => stat.refetch())}>
                Reintentar
              </Button>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
