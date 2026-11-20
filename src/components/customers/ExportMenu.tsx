import { EXPORT_FORMATS, type ExportFormat } from '../../schemas/customer.ts'
import { Button } from '../ui/Button.tsx'

type ExportMenuProps = {
  onExport: (format: ExportFormat) => void
  /** Formato que se está generando; mientras tanto, los botones quedan bloqueados. */
  pendingFormat?: ExportFormat
}

const FORMATS = Object.keys(EXPORT_FORMATS) as ExportFormat[]

// Exportar: un botón por formato, agrupados bajo una etiqueta. Sin menú desplegable: son cuatro
// opciones y así no hace falta manejar foco, Esc ni clics fuera.
export function ExportMenu({ onExport, pendingFormat }: ExportMenuProps) {
  return (
    <div role="group" aria-labelledby="export-label" className="flex flex-wrap items-center gap-2">
      <span id="export-label" className="text-sm text-ink-muted">
        Exportar
      </span>
      {FORMATS.map((format) => (
        <Button
          key={format}
          size="sm"
          onClick={() => onExport(format)}
          isPending={pendingFormat === format}
          disabled={pendingFormat !== undefined}
          aria-label={`Exportar a ${EXPORT_FORMATS[format].label}`}
        >
          {EXPORT_FORMATS[format].label}
        </Button>
      ))}
    </div>
  )
}
