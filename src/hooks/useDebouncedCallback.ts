import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'

// Devuelve `run`, que espera `delay` ms sin nuevas llamadas antes de ejecutar `callback`, y `cancel`,
// que descarta la llamada pendiente (p. ej. al limpiar los filtros antes de que venza el timer).
// Se usa dentro del handler (onChange del buscador), no en un effect que observa el texto: así
// solo reacciona a lo que escribe el usuario. Siempre ejecuta la versión más reciente de
// `callback`, aunque el componente se haya renderizado mientras corría el timer.
export function useDebouncedCallback<Args extends unknown[]>(callback: (...args: Args) => void, delay: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const callbackRef = useRef(callback)

  // El ref se actualiza después del render (no durante): mutar refs en el render rompe la pureza.
  useLayoutEffect(() => {
    callbackRef.current = callback
  })

  // El timer es un sistema externo: si el componente se desmonta, se cancela.
  useEffect(() => () => clearTimeout(timerRef.current), [])

  const cancel = useCallback(() => clearTimeout(timerRef.current), [])

  const run = useCallback(
    (...args: Args) => {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => callbackRef.current(...args), delay)
    },
    [delay],
  )

  return useMemo(() => ({ run, cancel }), [run, cancel])
}
