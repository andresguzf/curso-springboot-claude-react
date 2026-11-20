import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/authService.ts'
import { useAuthStore } from '../stores/authStore.ts'

// Sesión actual para los componentes: usuario, estado de la comprobación inicial y si es ADMIN.
export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const status = useAuthStore((state) => state.status)
  return { user, status, isAdmin: user?.role === 'ADMIN' }
}

// Inicia sesión. El backend pone las cookies; aquí solo se guarda el usuario que devuelve.
// La redirección la hace LoginPage al ver el estado 'authenticated'.
export function useLogin() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (user) => {
      // Sin datos cacheados de una sesión anterior (otro usuario u otro rol).
      queryClient.clear()
      setUser(user)
    },
  })
}
