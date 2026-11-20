import type { ReactNode } from 'react'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { EmptyState } from '../components/ui/EmptyState.tsx'
import { FormField } from '../components/ui/FormField.tsx'
import { Input } from '../components/ui/Input.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { Select } from '../components/ui/Select.tsx'
import { Spinner } from '../components/ui/Spinner.tsx'
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

        <Group title="Estado vacío">
          <EmptyState
            title="No hay clientes con estos filtros"
            description="Prueba con otro texto de búsqueda o quita alguno de los filtros."
            action={<Button variant="ghost">Limpiar filtros</Button>}
          />
        </Group>
      </div>
    </>
  )
}
