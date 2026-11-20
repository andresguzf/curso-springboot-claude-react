import { useFlashStore } from '../../stores/flashStore.ts'
import { FlashMessage } from './FlashMessage.tsx'

// Región de mensajes flash. Es `sticky` con altura 0: queda justo debajo del header y, al hacer
// scroll, sigue visible arriba de la pantalla, sin empujar el contenido cuando aparece un mensaje.
export function FlashMessages() {
  const messages = useFlashStore((state) => state.messages)
  const dismiss = useFlashStore((state) => state.dismiss)

  return (
    <div className="sticky top-0 z-50 h-0">
      {/* section con nombre = landmark de región: se puede saltar a ella; cada mensaje lleva su
          propio role="status" / "alert" para que el lector lo anuncie al aparecer. */}
      <section
        aria-label="Notificaciones"
        className="pointer-events-none absolute inset-x-0 top-3 flex flex-col items-center gap-2 px-4"
      >
        {messages.map((message) => (
          <FlashMessage key={message.id} flash={message} onDismiss={dismiss} />
        ))}
      </section>
    </div>
  )
}
