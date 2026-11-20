import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router'
import { RequireAuth } from './components/auth/RequireAuth.tsx'
import { AppLayout } from './components/layout/AppLayout.tsx'
import { AuthLayout } from './components/layout/AuthLayout.tsx'
import { DevUiPage } from './pages/DevUiPage.tsx'
import { ForbiddenPage } from './pages/ForbiddenPage.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
import { RouteErrorPage } from './pages/RouteErrorPage.tsx'

// Rutas que solo existen con `npm run dev` (catálogo de componentes; se elimina en F-04).
const devRoutes: RouteObject[] = import.meta.env.DEV ? [{ path: 'dev/ui', element: <DevUiPage /> }] : []

// El router se crea una sola vez, fuera del componente: así no se recrea en cada render.
const router = createBrowserRouter([
  // Pública: el login, en su propio layout (tarjeta centrada, sin header).
  {
    element: <AuthLayout />,
    errorElement: <RouteErrorPage />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  // Todo lo demás exige sesión. Las secciones de un rol van dentro de <RequireRole role="ADMIN" />:
  // escritura de clientes (spec 04) y usuarios (spec 05).
  {
    path: '/',
    element: <RequireAuth />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <HomePage /> },
          ...devRoutes,
          { path: 'forbidden', element: <ForbiddenPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
