// Fuente autoalojada (sin CDN): Atkinson Hyperlegible Next, elegida en specs/02-base-frontend/design.md
import '@fontsource-variable/atkinson-hyperlegible-next'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setAuthHandlers } from './lib/http.ts'
import { queryClient } from './lib/queryClient.ts'
import { initSession } from './lib/session.ts'
import { applyTheme, onSystemThemeChange } from './lib/theme.ts'
import { useAuthStore } from './stores/authStore.ts'
import { flash } from './stores/flashStore.ts'
import { useUiStore } from './stores/uiStore.ts'

// Qué hace la app cuando lib/http.ts renueva la sesión o no puede renovarla. lib/ no importa
// stores: la conexión se hace aquí, una sola vez al cargar el módulo.
setAuthHandlers({
  // El refresh trae el usuario actualizado: si cambió su rol, la interfaz se ajusta.
  onRefreshed: (user) => useAuthStore.getState().setUser(user),
  onSessionExpired: () => {
    const { status, clear } = useAuthStore.getState()
    clear()
    // Sin cache: no se deben ver datos del usuario anterior.
    queryClient.clear()
    // Al cargar sin sesión (status 'checking') no hay nada que avisar: nunca hubo sesión.
    if (status === 'authenticated') flash.info('Tu sesión expiró, inicia sesión de nuevo')
  },
})

initSession()

// Tema: index.html ya lo puso antes del primer pintado (sin destello); aquí se mantiene sincronizado
// cuando el usuario lo cambia o, con la preferencia 'system', cuando cambia el del sistema.
applyTheme(useUiStore.getState().theme)
useUiStore.subscribe((state, previous) => {
  if (state.theme !== previous.theme) applyTheme(state.theme)
})
onSystemThemeChange(() => applyTheme(useUiStore.getState().theme))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
