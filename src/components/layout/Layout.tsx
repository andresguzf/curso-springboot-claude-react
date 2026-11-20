import { Outlet } from 'react-router'
import { Footer } from './Footer.tsx'
import { Header } from './Header.tsx'

// Layout reutilizable: header + navbar arriba, contenido centrado y footer siempre abajo.
export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
