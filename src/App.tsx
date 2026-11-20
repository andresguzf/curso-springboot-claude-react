import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router'
import { AppLayout } from './components/layout/AppLayout.tsx'
import { AuthLayout } from './components/layout/AuthLayout.tsx'
import { DevUiPage } from './pages/DevUiPage.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'

// Rutas que solo existen con `npm run dev` (catálogo de componentes; se elimina en F-04).
const devRoutes: RouteObject[] = import.meta.env.DEV ? [{ path: 'dev/ui', element: <DevUiPage /> }] : []

// El router se crea una sola vez, fuera del componente: así no se recrea en cada render.
// /login va en AuthLayout (tarjeta centrada, sin header). Las rutas protegidas llegan en C-03.
const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
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
