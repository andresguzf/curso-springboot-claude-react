import { QueryClient } from '@tanstack/react-query'
import { HttpError } from './http.ts'

// Un único cliente para toda la app: es el cache compartido entre componentes.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 minuto: evita refetch innecesarios al navegar
      // Un 4xx (sin permiso, no existe, validación) no se arregla reintentando:
      // solo se reintenta una vez ante errores de red o 5xx.
      retry: (failureCount, error) =>
        !(error instanceof HttpError && error.status < 500) && failureCount < 1,
      refetchOnWindowFocus: true,
    },
  },
})
