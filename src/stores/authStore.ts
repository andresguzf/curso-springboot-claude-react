import { create } from 'zustand'
import type { User } from '../schemas/user.ts'

export type AuthStatus = 'checking' | 'authenticated' | 'anonymous'

type AuthState = {
  user: User | null
  /** `checking` mientras se consulta /api/auth/me al cargar la aplicación. */
  status: AuthStatus
  setUser: (user: User) => void
  clear: () => void
}

// Sesión del usuario actual. Solo guarda el usuario (id, email, rol): los tokens viven en
// cookies HttpOnly y JavaScript no los ve. Sin `persist`: al recargar se recupera con /me.
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: 'checking',
  setUser: (user) => set({ user, status: 'authenticated' }),
  clear: () => set({ user: null, status: 'anonymous' }),
}))
