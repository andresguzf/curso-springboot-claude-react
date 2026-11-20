import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router'
import { AppLayout } from './components/layout/AppLayout.tsx'
import { DevUiPage } from './pages/DevUiPage.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'

// Rutas que solo existen con `npm run dev` (catálogo de componentes; se elimina en F-04).
const devRoutes: RouteObject[] = import.meta.env.DEV ? [{ path: 'dev/ui', element: <DevUiPage /> }] : []

// El router se crea una sola vez, fuera del componente: así no se recrea en cada render.
// AuthLayout (login) se conecta en la spec 03.
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      ...devRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
