import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { Controller, useFieldArray, useForm, useWatch, type Control, type UseFormSetError } from 'react-hook-form'
import { Link } from 'react-router'
import { formatMoney } from '../../lib/format.ts'
import {
  EMPTY_INVOICE_ITEM,
  INVOICE_STATUSES,
  invoiceFormSchema,
  invoiceTotals,
  lineTotal,
  STATUS_LABELS,
  type InvoiceFormValues,
} from '../../schemas/invoice.ts'
import { Button } from '../ui/Button.tsx'
import { buttonClassName } from '../ui/buttonStyles.ts'
import { FormField } from '../ui/FormField.tsx'
import { IconButton } from '../ui/IconButton.tsx'
import { Input } from '../ui/Input.tsx'
import { Select } from '../ui/Select.tsx'
import { CustomerCombobox } from './CustomerCombobox.tsx'
import { InvoiceTotals } from './InvoiceTotals.tsx'

const MAX_ITEMS = 100

type InvoiceFormProps = {
  /**
   * Nombre del cliente cuando viene fijo (alta desde su ficha o edición): se muestra y no se edita.
   * Sin él, el cliente se elige con el autocompletado (alta desde el listado de facturas, spec 11).
   */
  customerName?: string
  defaultValues: InvoiceFormValues
  submitLabel: string
  isPending?: boolean
  /** Adónde vuelve "Cancelar". */
  cancelTo: string
  /** Recibe los valores ya validados y `setError`, para mostrar los errores del servidor por campo. */
  onSubmit: (values: InvoiceFormValues, setError: UseFormSetError<InvoiceFormValues>) => void
}

// Total de una línea mientras se escribe. Un componente aparte que observa solo su línea: así al
// escribir en una línea no se vuelve a dibujar todo el formulario.
function LineTotal({ control, index }: { control: Control<InvoiceFormValues>; index: number }) {
  const [quantity, unitPrice] = useWatch({ control, name: [`items.${index}.quantity`, `items.${index}.unitPrice`] })
  return <>{formatMoney(lineTotal(quantity, unitPrice))}</>
}

// Subtotal, IVA y total en vivo (vista previa: los importes definitivos los calcula el backend).
function LiveTotals({ control }: { control: Control<InvoiceFormValues> }) {
  const items = useWatch({ control, name: 'items' })
  return (
    <InvoiceTotals totals={invoiceTotals(items)} note="Vista previa: el sistema calcula los importes al guardar." />
  )
}

// Formulario de alta y edición de facturas (presentacional): valida con Zod y entrega los valores al
// padre, que llama a la API. Las líneas son un arreglo dinámico (useFieldArray). Para cargar otra
// factura, el padre le cambia la `key` (no se sincroniza con un effect).
export function InvoiceForm({ customerName, defaultValues, submitLabel, isPending = false, cancelTo, onSubmit }: InvoiceFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<InvoiceFormValues>({ resolver: zodResolver(invoiceFormSchema), defaultValues })
  // `id` de cada fila: la key estable que genera React Hook Form (nunca el índice).
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  // Error de la lista completa (sin líneas, más de 100): de Zod llega en `root` o en `message`.
  const itemsError = errors.items?.root?.message ?? errors.items?.message

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => onSubmit(values, setError))}
      className="space-y-6 rounded-panel border border-line bg-surface p-5 sm:p-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          {customerName ? (
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-ink">Cliente</p>
              <p className="text-[0.9375rem] text-ink">{customerName}</p>
            </div>
          ) : (
            <FormField label="Cliente" error={errors.customerId?.message}>
              {(field) => (
                <Controller
                  control={control}
                  name="customerId"
                  render={({ field: customerField }) => (
                    <CustomerCombobox
                      field={field}
                      // El formulario guarda solo el id; 0 = sin elegir (el esquema pide «Elige un cliente»).
                      onSelect={(customer) => customerField.onChange(customer?.id ?? 0)}
                      onBlur={customerField.onBlur}
                      inputRef={customerField.ref}
                    />
                  )}
                />
              )}
            </FormField>
          )}
        </div>
        <FormField label="Fecha de emisión" error={errors.issueDate?.message}>
          {(field) => <Input {...field} type="date" className="tabular-nums" {...register('issueDate')} />}
        </FormField>
        <FormField label="Fecha de vencimiento" hint="Opcional" error={errors.dueDate?.message}>
          {(field) => <Input {...field} type="date" className="tabular-nums" {...register('dueDate')} />}
        </FormField>
        <FormField label="Estado" error={errors.status?.message}>
          {(field) => (
            <Select {...field} {...register('status')}>
              {INVOICE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Notas" hint="Opcional, hasta 255 caracteres" error={errors.notes?.message}>
            {(field) => <Input {...field} autoComplete="off" {...register('notes')} />}
          </FormField>
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-base font-semibold text-ink">Líneas</legend>
        {itemsError && (
          <p role="alert" className="text-[0.8125rem] text-danger">
            {itemsError}
          </p>
        )}

        <ol className="space-y-3">
          {fields.map((item, index) => {
            const lineErrors = errors.items?.[index]
            return (
              <li key={item.id} className="rounded-control border border-line p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-ink-muted">Línea {index + 1}</p>
                  <IconButton
                    label={fields.length === 1 ? 'La factura necesita al menos una línea' : `Quitar la línea ${index + 1}`}
                    icon={Trash2}
                    tone="danger"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_7rem_9rem_8rem]">
                  <FormField label="Descripción" error={lineErrors?.description?.message}>
                    {(field) => <Input {...field} autoComplete="off" {...register(`items.${index}.description`)} />}
                  </FormField>
                  <FormField label="Cantidad" error={lineErrors?.quantity?.message}>
                    {(field) => (
                      <Input
                        {...field}
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        className="text-right tabular-nums"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                    )}
                  </FormField>
                  <FormField label="Precio unitario" error={lineErrors?.unitPrice?.message}>
                    {(field) => (
                      <Input
                        {...field}
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        className="text-right tabular-nums"
                        {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                      />
                    )}
                  </FormField>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-ink sm:text-right">Total</p>
                    <p className="flex h-10 items-center text-[0.9375rem] text-ink tabular-nums sm:justify-end">
                      <LineTotal control={control} index={index} />
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>

        <Button
          variant="secondary"
          size="sm"
          disabled={fields.length >= MAX_ITEMS}
          // append enfoca el primer campo de la línea nueva (la descripción).
          onClick={() => append(EMPTY_INVOICE_ITEM)}
        >
          <Plus aria-hidden="true" size={16} strokeWidth={1.75} />
          Agregar línea
        </Button>
      </fieldset>

      <LiveTotals control={control} />

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <Button type="submit" variant="primary" isPending={isPending}>
          {submitLabel}
        </Button>
        <Link to={cancelTo} className={buttonClassName({ variant: 'ghost' })}>
          Cancelar
        </Link>
      </div>
    </form>
  )
}
