import { create } from 'zustand'

export type FlashType = 'success' | 'error' | 'info'

export type Flash = {
  id: string
  type: FlashType
  text: string
  /** Milisegundos que el mensaje queda visible antes de cerrarse solo. */
  duration: number
}

type FlashState = {
  messages: Flash[]
  push: (flash: { type: FlashType; text: string; duration?: number }) => void
  dismiss: (id: string) => void
}

const DEFAULT_DURATION = 5_000
// Más de 3 mensajes a la vez tapan la pantalla: al llegar el cuarto se descarta el más antiguo.
const MAX_MESSAGES = 3

// Cola global de mensajes flash. Se publica desde handlers u onSuccess / onError de las
// mutaciones, nunca desde un useEffect que observa datos.
export const useFlashStore = create<FlashState>()((set) => ({
  messages: [],
  push: ({ type, text, duration = DEFAULT_DURATION }) =>
    set((state) => ({
      messages: [...state.messages, { id: crypto.randomUUID(), type, text, duration }].slice(-MAX_MESSAGES),
    })),
  dismiss: (id) =>
    set((state) => ({
      messages: state.messages.filter((message) => message.id !== id),
    })),
}))

// Atajos para usar fuera de componentes (onSuccess de una mutación, handlers de sesión en main.tsx).
export const flash = {
  success: (text: string) => useFlashStore.getState().push({ type: 'success', text }),
  error: (text: string) => useFlashStore.getState().push({ type: 'error', text }),
  info: (text: string) => useFlashStore.getState().push({ type: 'info', text }),
}
