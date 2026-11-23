import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 'system' sigue el tema del sistema operativo (prefers-color-scheme); los otros dos son la
// elección explícita del usuario.
export type ThemePreference = 'system' | 'light' | 'dark'

type UiState = {
  /** Sidebar de filtros expandido (true) o colapsado (false) en escritorio. */
  filtersOpen: boolean
  toggleFilters: () => void
  setFiltersOpen: (open: boolean) => void
  /** Tema de la interfaz; por defecto, el del sistema. */
  theme: ThemePreference
  setTheme: (theme: ThemePreference) => void
}

// Preferencias de interfaz del usuario. `persist` las guarda en localStorage ("ui"), así el
// sidebar y el tema se conservan al recargar (index.html lee el tema antes del primer pintado).
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      filtersOpen: true,
      toggleFilters: () => set((state) => ({ filtersOpen: !state.filtersOpen })),
      setFiltersOpen: (filtersOpen) => set({ filtersOpen }),
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui',
      // Solo se guardan los datos; las acciones no se persisten.
      partialize: (state) => ({ filtersOpen: state.filtersOpen, theme: state.theme }),
    },
  ),
)
