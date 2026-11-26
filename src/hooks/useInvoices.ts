import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invoiceFiltersSchema, type InvoiceFilters, type InvoiceFormValues } from '../schemas/invoice.ts'
import { invoiceService } from '../services/invoiceService.ts'
import { flash } from '../stores/flashStore.ts'

// Claves del cache de facturas, centralizadas: las mutaciones invalidan `all` y así se refrescan
// juntos el listado, la sección de la ficha del cliente (es un listado con customerId) y los detalles.
export const invoiceKeys = {
  all: ['invoices'] as const,
  list: (filters: InvoiceFilters) => [...invoiceKeys.all, 'list', filters] as const,
  detail: (id: number) => [...invoiceKeys.all, 'detail', id] as const,
  // Bajo `all`: crear, editar o eliminar facturas (y eliminar o editar clientes) refresca el resumen.
  stats: () => [...invoiceKeys.all, 'stats'] as const,
}

// Una página del listado (también la sección de facturas de un cliente). Con keepPreviousData,
// al cambiar de página u orden se siguen viendo los datos anteriores (isPlaceholderData = true).
export function useInvoicesPage(filters: InvoiceFilters) {
  return useQuery({
    queryKey: invoiceKeys.list(filters),
    queryFn: () => invoiceService.page(filters),
    placeholderData: keepPreviousData,
  })
}

// Cuántas facturas tiene un cliente (solo page.totalElements: una página de 1). Sin cliente no consulta.
// La usa el modal de eliminar cliente para avisar cuántas se eliminarán con él (spec 11).
export function useInvoiceCount(customerId: number | undefined) {
  const filters: InvoiceFilters = { ...invoiceFiltersSchema.parse({}), customerId, size: 1 }
  return useQuery({
    queryKey: invoiceKeys.list(filters),
    queryFn: () => invoiceService.page(filters),
    select: (page) => page.page.totalElements,
    enabled: customerId !== undefined,
  })
}

// Estadísticas de facturación del resumen.
export function useInvoiceStats() {
  return useQuery({ queryKey: invoiceKeys.stats(), queryFn: () => invoiceService.stats() })
}

export function useInvoice(id: number) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoiceService.get(id),
    // Un id inválido en la URL (/invoices/abc) no llega a la API.
    enabled: Number.isInteger(id) && id > 0,
  })
}

// Alta. En onSuccess se publica el flash y se refresca todo lo cacheado de facturas; la navegación
// la decide la página (callback de mutate).
export function useCreateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: InvoiceFormValues) => invoiceService.create(values),
    onSuccess: async (invoice) => {
      flash.success(`Factura «${invoice.invoiceNumber}» creada`)
      await queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
    },
  })
}

// Edición. El cliente no cambia desde el dashboard: va fijo en los valores del formulario.
export function useUpdateInvoice(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: InvoiceFormValues) => invoiceService.update(id, values),
    onSuccess: async (invoice) => {
      flash.success(`Factura «${invoice.invoiceNumber}» actualizada`)
      await queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
    },
  })
}

// Eliminación. El modal de confirmación usa isPending y error de esta mutación; la página cierra el
// modal (y navega o ajusta la página) en el onSuccess de mutate.
export function useDeleteInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => invoiceService.remove(id),
    onSuccess: async (_, id) => {
      flash.success('Factura eliminada')
      // El detalle ya no existe: se quita del cache en vez de refrescarlo (daría 404).
      queryClient.removeQueries({ queryKey: invoiceKeys.detail(id) })
      await queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
    },
  })
}
