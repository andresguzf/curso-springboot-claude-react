import { useSyncExternalStore } from 'react'

// Suscribe el componente a una media query (sistema externo: el navegador) sin useEffect + useState.
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}
