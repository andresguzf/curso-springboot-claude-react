import { create } from 'zustand'
import type { User } from '../schemas/user.ts'

export type AuthStatus = 'checking' | 'authenticated' | 'anonymous'

type AuthState = {
  user: User | null
  /** `checking` mientras se consulta /api/auth/me al cargar la aplicación. */
  status: AuthStatus
  /**
   * La sesión terminó porque el usuario la cerró (no porque expiró). RequireAuth lo usa para no
   * guardar la ruta de origen: quien entre después empieza en el inicio, no donde estaba el otro.
   */
  loggedOut: boolean
  setUser: (user: User) => void
  clear: (options?: { loggedOut?: boolean }) => void
}

// Sesión del usuario actual. Solo guarda el usuario (id, email, rol): los tokens viven en
// cookies HttpOnly y JavaScript no los ve. Sin `persist`: al recargar se recupera con /me.
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: 'checking',
  loggedOut: false,
  setUser: (user) => set({ user, status: 'authenticated', loggedOut: false }),
  clear: (options) => set({ user: null, status: 'anonymous', loggedOut: options?.loggedOut ?? false }),
}))
