import { Outlet } from 'react-router'
import { Footer } from './Footer.tsx'
import { Header } from './Header.tsx'

// Layout de las pantallas internas: header (marca + navegación), contenido ancho para las tablas
// y footer siempre abajo. Los mensajes flash (B-06) se muestran entre el header y el contenido.
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
