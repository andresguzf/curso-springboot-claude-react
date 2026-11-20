import { useState, type ReactNode } from 'react'
import { FiltersLayout } from '../components/filters/FiltersLayout.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { DataTable, type DataTableColumn } from '../components/ui/DataTable.tsx'
import { ConfirmDialog } from '../components/ui/ConfirmDialog.tsx'
import { EmptyState } from '../components/ui/EmptyState.tsx'
import { FormField } from '../components/ui/FormField.tsx'
import { Input } from '../components/ui/Input.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { Pagination } from '../components/ui/Pagination.tsx'
import { Select } from '../components/ui/Select.tsx'
import { Spinner } from '../components/ui/Spinner.tsx'
import { formatDate } from '../lib/format.ts'
import { flash } from '../stores/flashStore.ts'

// Catálogo de componentes para revisarlos durante el desarrollo. La ruta /dev/ui solo existe
// con `npm run dev` (import.meta.env.DEV) y se elimina en la tarea F-04.

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-panel border border-line bg-surface p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  )
}

type DemoOutcome = 'ok' | 'error'

// Simula una eliminación de 1 segundo que funciona o que falla, para probar el modal.
function ConfirmDialogDemo() {
  const [outcome, setOutcome] = useState<DemoOutcome | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function open(next: DemoOutcome) {
    setError(null)
    setOutcome(next)
  }

  function handleConfirm() {
    setIsPending(true)
    setError(null)
    setTimeout(() => {
      setIsPending(false)
      if (outcome === 'error') {
        setError('Debe quedar al menos un administrador habilitado')
        return
      }
      setOutcome(null)
      flash.success('Cliente eliminado')
    }, 1000)
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="danger" onClick={() => open('ok')}>
          Eliminar (funciona)
        </Button>
        <Button onClick={() => open('error')}>Eliminar (falla)</Button>
      </div>
      <ConfirmDialog
        open={outcome !== null}
        title="¿Eliminar a «Ana Pérez»?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        tone="danger"
        isPending={isPending}
        error={error}
        onConfirm={handleConfirm}
        onCancel={() => setOutcome(null)}
      />
    </>
  )
}

// Datos ficticios para la tabla de ejemplo (37 filas: 4 páginas de 10).
type DemoCustomer = {
  id: number
  name: string
  lastName: string
  email: string
  phone: string
  city: string
  birthDate: string
  active: boolean
}

const DEMO_NAMES = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Felipe', 'Gabriela', 'Hugo', 'Isabel', 'Javier']
const DEMO_LAST_NAMES = ['Pérez', 'Soto', 'Muñoz', 'Rojas', 'Díaz', 'Vargas', 'Castro', 'Fuentes']
const DEMO_CITIES = ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Temuco', 'Antofagasta']

const DEMO_CUSTOMERS: DemoCustomer[] = Array.from({ length: 37 }, (_, index) => {
  const id = index + 1
  return {
    id,
    name: DEMO_NAMES[index % DEMO_NAMES.length],
    lastName: DEMO_LAST_NAMES[(index * 3) % DEMO_LAST_NAMES.length],
    email: `cliente${id}@ejemplo.com`,
    phone: `+56 9 1000 ${String(id).padStart(4, '0')}`,
    city: DEMO_CITIES[(index * 5) % DEMO_CITIES.length],
    birthDate: `${1960 + ((index * 7) % 40)}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`,
    active: index % 4 !== 0,
  }
})

const DEMO_COLUMNS: DataTableColumn<DemoCustomer>[] = [
  { key: 'id', header: 'ID', sortField: 'id', cell: (row) => row.id, className: 'tabular-nums w-px' },
  { key: 'name', header: 'Nombre', sortField: 'lastName', cell: (row) => `${row.name} ${row.lastName}` },
  { key: 'email', header: 'Email', sortField: 'email', cell: (row) => row.email },
  { key: 'phone', header: 'Teléfono', cell: (row) => row.phone, className: 'tabular-nums' },
  { key: 'city', header: 'Ciudad', sortField: 'city', cell: (row) => row.city },
  {
    key: 'birthDate',
    header: 'Nacimiento',
    sortField: 'birthDate',
    cell: (row) => formatDate(row.birthDate),
    className: 'tabular-nums',
  },
  {
    key: 'active',
    header: 'Estado',
    sortField: 'active',
    cell: (row) => (row.active ? <Badge tone="success">Activo</Badge> : <Badge>Inactivo</Badge>),
  },
]

const DEMO_SIZES = [10, 25, 50] as const

// Orden y paginación en memoria, solo para el catálogo; en /customers los hace la API.
function TableDemo() {
  const [sort, setSort] = useState('id,asc')
  const [page, setPage] = useState(1)
  const [size, setSize] = useState<number>(10)

  const [field, direction] = sort.split(',') as [keyof DemoCustomer, string]
  const sorted = DEMO_CUSTOMERS.toSorted((a, b) => {
    const order = String(a[field]).localeCompare(String(b[field]), 'es', { numeric: true })
    return direction === 'desc' ? -order : order
  })
  const totalPages = Math.ceil(sorted.length / size)
  const rows = sorted.slice((page - 1) * size, page * size)

  return (
    <div className="space-y-3">
      <DataTable
        caption="Clientes de ejemplo"
        columns={DEMO_COLUMNS}
        rows={rows}
        getRowId={(row) => row.id}
        sort={sort}
        onSortChange={(next) => {
          setSort(next)
          setPage(1)
        }}
      />
      <Pagination
        page={page}
        size={size}
        totalElements={sorted.length}
        totalPages={totalPages}
        sizes={DEMO_SIZES}
        onPageChange={setPage}
        onSizeChange={(next) => {
          setSize(next)
          setPage(1)
        }}
      />
    </div>
  )
}

// Filtros de ejemplo con estado local; en las páginas reales vendrán de la URL (spec 04).
function FiltersDemo() {
  const [status, setStatus] = useState('')
  const [city, setCity] = useState('')
  // Derivado en el render: no hace falta otro estado ni un effect.
  const activeCount = [status, city.trim()].filter(Boolean).length

  return (
    <FiltersLayout
      activeCount={activeCount}
      onClear={() => {
        setStatus('')
        setCity('')
      }}
      filters={
        <>
          <FormField label="Estado">
            {(field) => (
              <Select {...field} value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </Select>
            )}
          </FormField>
          <FormField label="Ciudad">
            {(field) => <Input {...field} value={city} onChange={(event) => setCity(event.target.value)} />}
          </FormField>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-ink-muted">
          Colapsa el sidebar con el botón de la izquierda y recarga la página: conserva su estado. En pantallas chicas,
          los filtros se abren con el botón «Filtros». La tabla ordena por columna (clic en el encabezado) y, a 375 px,
          se desplaza en horizontal dentro de su recuadro.
        </p>
        <TableDemo />
      </div>
    </FiltersLayout>
  )
}

export function DevUiPage() {
  return (
    <>
      <PageHeader
        title="Componentes"
        description="Catálogo de las piezas base de la interfaz. Solo visible en desarrollo."
        actions={
          <>
            <Button>Exportar</Button>
            <Button variant="primary">Nuevo cliente</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Group title="Botones">
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">Guardar</Button>
            <Button>Cancelar</Button>
            <Button variant="danger">Eliminar</Button>
            <Button variant="ghost">Limpiar filtros</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" size="sm">
              Pequeño
            </Button>
            <Button variant="primary" isPending>
              Guardando
            </Button>
            <Button disabled>Deshabilitado</Button>
          </div>
        </Group>

        <Group title="Campos">
          <FormField label="Nombre" hint="Máximo 80 caracteres.">
            {(field) => <Input {...field} placeholder="Ana" />}
          </FormField>
          <FormField label="Email" error="El email no tiene un formato válido">
            {(field) => <Input {...field} type="email" defaultValue="ana@" />}
          </FormField>
          <FormField label="Estado">
            {(field) => (
              <Select {...field} defaultValue="">
                <option value="">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </Select>
            )}
          </FormField>
        </Group>

        <Group title="Badges y carga">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="success">Activo</Badge>
            <Badge>Inactivo</Badge>
            <Badge tone="accent">Administrador</Badge>
            <Badge>Usuario</Badge>
            <Badge tone="danger">Deshabilitado</Badge>
            <Badge tone="warning">Pendiente</Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-ink-muted">
            <Spinner className="size-5" /> Cargando clientes…
          </div>
          <p className="text-sm text-ink-muted tabular-nums">
            Cifras tabulares: 1.111 · 8.888 · +56 9 1000 0001 · 2026-11-20
          </p>
        </Group>

        <Group title="Mensajes flash">
          <p className="text-sm text-ink-muted">
            Aparecen arriba, se cierran solos a los 5 segundos (se pausan con el puntero o el foco) y con la X.
            Como máximo se muestran 3.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => flash.success('Cliente «Ana Pérez» creado')}>Éxito</Button>
            <Button onClick={() => flash.error('No se pudo eliminar el cliente. Inténtalo de nuevo.')}>Error</Button>
            <Button onClick={() => flash.info('Tu sesión expiró, inicia sesión de nuevo')}>Información</Button>
            <Button
              variant="ghost"
              onClick={() => {
                for (const n of [1, 2, 3, 4]) flash.info(`Mensaje ${n} de 4`)
              }}
            >
              Cuatro seguidos
            </Button>
          </div>
        </Group>

        <Group title="Modal de confirmación">
          <p className="text-sm text-ink-muted">
            Esc o Cancelar cierran sin ejecutar; el foco empieza en Cancelar y no sale del modal. «Falla» muestra el
            error dentro del modal.
          </p>
          <ConfirmDialogDemo />
        </Group>

        <Group title="Estado vacío">
          <EmptyState
            title="No hay clientes con estos filtros"
            description="Prueba con otro texto de búsqueda o quita alguno de los filtros."
            action={<Button variant="ghost">Limpiar filtros</Button>}
          />
        </Group>
      </div>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-semibold">Sidebar de filtros, tabla y paginación</h2>
        <FiltersDemo />
      </section>
    </>
  )
}
