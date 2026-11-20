import { Outlet } from 'react-router'
import { FlashMessages } from '../ui/FlashMessages.tsx'
import { Footer } from './Footer.tsx'
import { Header } from './Header.tsx'
import { NavigationProgress } from './NavigationProgress.tsx'

// Layout de las pantallas internas: header (marca + navegación), mensajes flash arriba,
// contenido ancho para las tablas y footer siempre abajo.
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavigationProgress />
      <Header />
      <FlashMessages />
      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
