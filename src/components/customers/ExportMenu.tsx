import { Download, FileCode, FileSpreadsheet, FileText, FileType, type LucideIcon } from 'lucide-react'
import { useRef } from 'react'
import { EXPORT_FORMATS, type ExportFormat } from '../../schemas/customer.ts'
import { IconButton } from '../ui/IconButton.tsx'

type ExportMenuProps = {
  onExport: (format: ExportFormat) => void
  /** Formato que se está generando: el botón muestra la carga y no se puede abrir el menú. */
  pendingFormat?: ExportFormat
}

const FORMATS = Object.keys(EXPORT_FORMATS) as ExportFormat[]

const FORMAT_ICONS: Record<ExportFormat, LucideIcon> = {
  csv: FileText,
  xlsx: FileSpreadsheet,
  pdf: FileType,
  xml: FileCode,
}

const MENU_ID = 'export-menu'

// Exportar: un botón de icono que abre una lista de formatos. Es un popover nativo (atributo
// `popover` + `popoverTarget`): el navegador lo muestra en la capa superior, lo cierra con Esc o con
// un clic fuera y marca aria-expanded en el botón, sin effects. Se recorre con Tab (patrón
// "disclosure"). Se coloca bajo el botón con CSS anchor positioning.
export function ExportMenu({ onExport, pendingFormat }: ExportMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  function choose(format: ExportFormat) {
    menuRef.current?.hidePopover()
    onExport(format)
  }

  return (
    <>
      <IconButton
        label={pendingFormat ? `Generando ${EXPORT_FORMATS[pendingFormat].label}…` : 'Exportar'}
        icon={Download}
        isPending={pendingFormat !== undefined}
        popoverTarget={MENU_ID}
        className="[anchor-name:--export-menu]"
      />
      <div
        ref={menuRef}
        id={MENU_ID}
        popover="auto"
        aria-label="Exportar a"
        className="m-0 mt-1 w-44 rounded-panel border border-line bg-surface p-1 text-ink shadow-[0_6px_20px_rgb(31_41_51/0.12)] [inset:auto] [position-anchor:--export-menu] [position-area:bottom_span-left] [position-try-fallbacks:flip-inline,flip-block,flip-block_flip-inline]"
      >
        <p className="px-2.5 pt-1.5 pb-1 text-[0.8125rem] text-ink-muted">Exportar el resultado a</p>
        <ul>
          {FORMATS.map((format) => {
            const Icon = FORMAT_ICONS[format]
            return (
              <li key={format}>
                <button
                  type="button"
                  onClick={() => choose(format)}
                  className="flex w-full items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-sm hover:bg-canvas"
                >
                  <Icon aria-hidden="true" size={16} strokeWidth={1.75} className="text-ink-muted" />
                  {EXPORT_FORMATS[format].label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
