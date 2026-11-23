import { useMutation } from '@tanstack/react-query'
import { errorMessage } from '../lib/errors.ts'
import { saveFile } from '../lib/saveFile.ts'
import type { CustomerFilters, ExportFormat } from '../schemas/customer.ts'
import { customerService } from '../services/customerService.ts'
import { flash } from '../stores/flashStore.ts'

type ExportRequest = { filters: CustomerFilters; format: ExportFormat }

// Exportación del listado (USER y ADMIN). Es una mutación aunque solo lea: se dispara con un clic,
// no se cachea y tiene su propio estado de carga (`variables.format` dice qué botón está en curso).
export function useExportCustomers() {
  return useMutation({
    mutationFn: ({ filters, format }: ExportRequest) => customerService.exportFile(filters, format),
    onSuccess: ({ blob, filename }) => saveFile(blob, filename),
    onError: (error) => flash.error(errorMessage(error, 'No se pudo generar el archivo. Inténtalo de nuevo.')),
  })
}

// Ficha de un cliente en PDF, desde su detalle (USER y ADMIN). Mismo patrón que la exportación del listado.
export function useExportCustomerPdf() {
  return useMutation({
    mutationFn: (id: number) => customerService.exportPdf(id),
    onSuccess: ({ blob, filename }) => saveFile(blob, filename),
    onError: (error) => flash.error(errorMessage(error, 'No se pudo generar el PDF. Inténtalo de nuevo.')),
  })
}
