import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/authService.ts'
import { useAuthStore } from '../stores/authStore.ts'
import { flash } from '../stores/flashStore.ts'

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

// Cierra la sesión: el backend revoca el refresh token y borra las cookies.
export function useLogout() {
  const queryClient = useQueryClient()
  const clear = useAuthStore((state) => state.clear)

  return useMutation({
    mutationFn: authService.logout,
    // onSettled y no onSuccess: aunque la API falle (red caída, token vencido), el usuario
    // pidió salir, así que la sesión local se limpia igual.
    onSettled: () => {
      // No se navega aquí: al quedar 'anonymous', RequireAuth lleva al login (una sola
      // redirección; con loggedOut no guarda la ruta de origen).
      clear({ loggedOut: true })
      queryClient.clear()
      flash.success('Sesión cerrada')
    },
  })
}
