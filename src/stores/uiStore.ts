import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type UiState = {
  /** Sidebar de filtros expandido (true) o colapsado (false) en escritorio. */
  filtersOpen: boolean
  toggleFilters: () => void
  setFiltersOpen: (open: boolean) => void
}

// Preferencias de interfaz del usuario. `persist` las guarda en localStorage ("ui"),
// así el sidebar conserva su estado al recargar.
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      filtersOpen: true,
      toggleFilters: () => set((state) => ({ filtersOpen: !state.filtersOpen })),
      setFiltersOpen: (filtersOpen) => set({ filtersOpen }),
    }),
    {
      name: 'ui',
      // Solo se guarda el dato; las acciones no se persisten.
      partialize: (state) => ({ filtersOpen: state.filtersOpen }),
    },
  ),
)
