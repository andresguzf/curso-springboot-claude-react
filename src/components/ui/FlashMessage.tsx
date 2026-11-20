import { useEffect, useRef, useState, type FocusEvent } from 'react'
import type { Flash, FlashType } from '../../stores/flashStore.ts'

type FlashMessageProps = {
  flash: Flash
  onDismiss: (id: string) => void
}

const ICON_COLOR: Record<FlashType, string> = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-ink-muted',
}

// Trazos de 24×24 para cada tipo: check, signo de exclamación e "i".
const ICON_PATH: Record<FlashType, string> = {
  success: 'm8 12.5 2.5 2.5L16 9.5',
  error: 'M12 7.5v5.5M12 16.5v.01',
  info: 'M12 11v5.5M12 7.5v.01',
}

export function FlashMessage({ flash, onDismiss }: FlashMessageProps) {
  const [paused, setPaused] = useState(false)
  // Tiempo que le queda al mensaje; se descuenta cada vez que se pausa.
  const remaining = useRef(flash.duration)

  // Un timer es un sistema externo: el effect lo programa y lo limpia. Al pausar (hover o foco)
  // la limpieza descuenta lo transcurrido; al reanudar se programa con el tiempo restante.
  useEffect(() => {
    if (paused) return
    const startedAt = Date.now()
    const timer = setTimeout(() => onDismiss(flash.id), remaining.current)
    return () => {
      clearTimeout(timer)
      remaining.current -= Date.now() - startedAt
    }
  }, [paused, flash.id, onDismiss])

  // Mientras el foco siga dentro del mensaje (p. ej. en la X), sigue en pausa.
  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
  }

  return (
    <div
      role={flash.type === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={handleBlur}
      className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-panel border bg-surface px-4 py-3 text-[0.9375rem] text-ink shadow-[0_6px_20px_rgb(31_41_51/0.12)] motion-safe:animate-flash-in ${
        flash.type === 'error' ? 'border-danger/40' : 'border-line'
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`mt-0.5 size-5 shrink-0 ${ICON_COLOR[flash.type]}`}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d={ICON_PATH[flash.type]} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="flex-1">{flash.text}</p>
      <button
        type="button"
        onClick={() => onDismiss(flash.id)}
        aria-label="Cerrar mensaje"
        className="-m-1 rounded-control p-1 text-ink-muted hover:bg-canvas hover:text-ink"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
