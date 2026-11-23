import type { ThemePreference } from '../stores/uiStore.ts'

export type Theme = 'light' | 'dark'

export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)'

const darkScheme = window.matchMedia(DARK_SCHEME_QUERY)

// Tema que se ve: la elección del usuario o, con 'system', el del sistema operativo.
export function resolveTheme(preference: ThemePreference, systemDark = darkScheme.matches): Theme {
  if (preference === 'system') return systemDark ? 'dark' : 'light'
  return preference
}

// Aplica el tema al documento: index.css redefine los tokens bajo :root[data-theme="dark"].
// Es sincronizar con el DOM (un sistema externo): se llama desde main.tsx, no desde un componente.
export function applyTheme(preference: ThemePreference): void {
  document.documentElement.dataset.theme = resolveTheme(preference)
}

// Avisa cuando cambia el tema del sistema (para la preferencia 'system').
export function onSystemThemeChange(listener: () => void): void {
  darkScheme.addEventListener('change', listener)
}
