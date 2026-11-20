import { authService } from '../services/authService.ts'
import { useAuthStore } from '../stores/authStore.ts'

// Restaura la sesión al cargar la aplicación. Se llama una sola vez desde main.tsx, antes del
// render (no en un useEffect). Si el access token venció, lib/http.ts renueva la sesión con el
// refresh token antes de reintentar /me.
export function initSession(): void {
  const { setUser, clear } = useAuthStore.getState()
  authService
    .me()
    .then(setUser)
    // 401 tras un refresh fallido, 404 (el usuario ya no existe) o backend caído: sin sesión.
    .catch(() => clear())
}
