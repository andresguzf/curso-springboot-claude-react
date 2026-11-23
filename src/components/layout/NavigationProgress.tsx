import { useNavigation } from 'react-router'

// Barra fina arriba de la pantalla mientras el router descarga el código de la pantalla nueva
// (rutas con carga diferida). La pantalla anterior sigue visible hasta que llega la nueva.
// Con prefers-reduced-motion la barra aparece entera, sin animación.
export function NavigationProgress() {
  const navigation = useNavigation()
  if (navigation.state !== 'loading') return null

  return (
    <div
      role="progressbar"
      aria-label="Cargando la pantalla"
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-accent opacity-0 motion-safe:animate-navigation-progress motion-reduce:opacity-100"
    />
  )
}
