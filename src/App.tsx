import { createBrowserRouter, RouterProvider } from 'react-router'
import { RequireAuth } from './components/auth/RequireAuth.tsx'
import { RequireRole } from './components/auth/RequireRole.tsx'
import { AppLayout } from './components/layout/AppLayout.tsx'
import { AuthLayout } from './components/layout/AuthLayout.tsx'
import { CustomerCreatePage } from './pages/CustomerCreatePage.tsx'
import { CustomerDetailPage } from './pages/CustomerDetailPage.tsx'
import { CustomerEditPage } from './pages/CustomerEditPage.tsx'
import { CustomersPage } from './pages/CustomersPage.tsx'
import { ForbiddenPage } from './pages/ForbiddenPage.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
import { RouteErrorPage } from './pages/RouteErrorPage.tsx'
import { UserCreatePage } from './pages/UserCreatePage.tsx'
import { UserDetailPage } from './pages/UserDetailPage.tsx'
import { UserEditPage } from './pages/UserEditPage.tsx'
import { UsersPage } from './pages/UsersPage.tsx'

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
          { index: true, element: <DashboardPage /> },
          // Lectura de clientes: USER y ADMIN.
          { path: 'customers', element: <CustomersPage /> },
          { path: 'customers/:id', element: <CustomerDetailPage /> },
          // Solo ADMIN (un USER va a /forbidden): escritura de clientes y toda la sección de usuarios.
          // 'customers/new' gana a 'customers/:id' porque React Router prioriza los segmentos fijos.
          {
            element: <RequireRole role="ADMIN" />,
            children: [
              { path: 'customers/new', element: <CustomerCreatePage /> },
              { path: 'customers/:id/edit', element: <CustomerEditPage /> },
              { path: 'users', element: <UsersPage /> },
              { path: 'users/new', element: <UserCreatePage /> },
              { path: 'users/:id', element: <UserDetailPage /> },
              { path: 'users/:id/edit', element: <UserEditPage /> },
            ],
          },
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
