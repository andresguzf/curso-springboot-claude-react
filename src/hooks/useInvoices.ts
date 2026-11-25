import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { InvoiceFilters, InvoiceFormValues } from '../schemas/invoice.ts'
import { invoiceService } from '../services/invoiceService.ts'
import { flash } from '../stores/flashStore.ts'

// Claves del cache de facturas, centralizadas: las mutaciones invalidan `all` y así se refrescan
// juntos el listado, la sección de la ficha del cliente (es un listado con customerId) y los detalles.
export const invoiceKeys = {
  all: ['invoices'] as const,
  list: (filters: InvoiceFilters) => [...invoiceKeys.all, 'list', filters] as const,
  detail: (id: number) => [...invoiceKeys.all, 'detail', id] as const,
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

export function useInvoice(id: number) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoiceService.get(id),
    // Un id inválido en la URL (/invoices/abc) no llega a la API.
    enabled: Number.isInteger(id) && id > 0,
  })
}

// El cliente no es parte del formulario: llega fijo desde la ficha (alta) o desde la factura (edición).
type InvoiceInput = { customerId: number; values: InvoiceFormValues }

// Alta. En onSuccess se publica el flash y se refresca todo lo cacheado de facturas; la navegación
// la decide la página (callback de mutate).
export function useCreateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ customerId, values }: InvoiceInput) => invoiceService.create(customerId, values),
    onSuccess: async (invoice) => {
      flash.success(`Factura «${invoice.invoiceNumber}» creada`)
      await queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
    },
  })
}

// Edición. El cliente no cambia desde el dashboard: la página reenvía el de la factura.
export function useUpdateInvoice(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ customerId, values }: InvoiceInput) => invoiceService.update(id, customerId, values),
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
