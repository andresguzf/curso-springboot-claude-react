import { QueryClient } from '@tanstack/react-query'

// Un único cliente para toda la app: es el cache compartido entre componentes.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 minuto: evita refetch innecesarios al navegar
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
})
