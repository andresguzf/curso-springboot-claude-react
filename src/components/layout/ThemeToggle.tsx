import { Moon, Sun } from 'lucide-react'
import { useMediaQuery } from '../../hooks/useMediaQuery.ts'
import { DARK_SCHEME_QUERY, resolveTheme } from '../../lib/theme.ts'
import { useUiStore } from '../../stores/uiStore.ts'
import { IconButton } from '../ui/IconButton.tsx'

// Cambia entre tema claro y oscuro. El icono muestra a qué tema se pasa (luna → oscuro, sol →
// claro). Al usarlo, la preferencia deja de ser 'system' y queda la elección del usuario.
export function ThemeToggle() {
  const theme = useUiStore((state) => state.theme)
  const setTheme = useUiStore((state) => state.setTheme)
  // Tema del sistema como suscripción (useSyncExternalStore): si cambia, el icono se actualiza.
  const systemDark = useMediaQuery(DARK_SCHEME_QUERY)
  const isDark = resolveTheme(theme, systemDark) === 'dark'

  return (
    <IconButton
      label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      icon={isDark ? Sun : Moon}
      tone="band"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    />
  )
}
