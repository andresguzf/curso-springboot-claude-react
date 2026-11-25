import { createBrowserRouter, RouterProvider } from 'react-router'
import { RequireAuth } from './components/auth/RequireAuth.tsx'
import { RequireRole } from './components/auth/RequireRole.tsx'
import { AppLayout } from './components/layout/AppLayout.tsx'
import { AuthLayout } from './components/layout/AuthLayout.tsx'
import { Spinner } from './components/ui/Spinner.tsx'
import { ForbiddenPage } from './pages/ForbiddenPage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
import { RouteErrorPage } from './pages/RouteErrorPage.tsx'

// Carga diferida por ruta: cada página es un chunk propio que el router descarga ANTES de cambiar
// de pantalla (sin fallback que parpadee; mientras tanto, NavigationProgress). Así el login no
// descarga clientes ni usuarios. Quedan en el chunk inicial los layouts, las guardas de sesión y
// rol, y las páginas mínimas que deben estar siempre (404, sin permiso, error).

// Mientras se descarga la primera pantalla al abrir la aplicación.
const initialLoad = (
  <div className="flex min-h-screen items-center justify-center text-ink-muted">
    <Spinner label="Cargando" className="size-6" />
  </div>
)

// El router se crea una sola vez, fuera del componente: así no se recrea en cada render.
const router = createBrowserRouter([
  // Pública: el login, en su propio layout (tarjeta centrada, sin header).
  {
    element: <AuthLayout />,
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: initialLoad,
    children: [
      { path: '/login', lazy: () => import('./pages/LoginPage.tsx').then((m) => ({ Component: m.LoginPage })) },
    ],
  },
  // Todo lo demás exige sesión. Las secciones de un rol van dentro de <RequireRole role="ADMIN" />.
  {
    path: '/',
    element: <RequireAuth />,
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: initialLoad,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, lazy: () => import('./pages/DashboardPage.tsx').then((m) => ({ Component: m.DashboardPage })) },
          // Lectura de clientes: USER y ADMIN.
          {
            path: 'customers',
            lazy: () => import('./pages/CustomersPage.tsx').then((m) => ({ Component: m.CustomersPage })),
          },
          {
            path: 'customers/:id',
            lazy: () => import('./pages/CustomerDetailPage.tsx').then((m) => ({ Component: m.CustomerDetailPage })),
          },
          // Lectura de facturas: USER y ADMIN.
          {
            path: 'invoices',
            lazy: () => import('./pages/InvoicesPage.tsx').then((m) => ({ Component: m.InvoicesPage })),
          },
          {
            path: 'invoices/:id',
            lazy: () => import('./pages/InvoiceDetailPage.tsx').then((m) => ({ Component: m.InvoiceDetailPage })),
          },
          // Solo ADMIN (un USER va a /forbidden): escritura de clientes y facturas, y toda la sección de usuarios.
          // 'customers/new' gana a 'customers/:id' porque React Router prioriza los segmentos fijos.
          {
            element: <RequireRole role="ADMIN" />,
            children: [
              {
                path: 'customers/new',
                lazy: () => import('./pages/CustomerCreatePage.tsx').then((m) => ({ Component: m.CustomerCreatePage })),
              },
              {
                path: 'customers/:id/edit',
                lazy: () => import('./pages/CustomerEditPage.tsx').then((m) => ({ Component: m.CustomerEditPage })),
              },
              // 'invoices/new' gana a 'invoices/:id' (segmento fijo), igual que en clientes.
              {
                path: 'invoices/new',
                lazy: () => import('./pages/InvoiceCreatePage.tsx').then((m) => ({ Component: m.InvoiceCreatePage })),
              },
              {
                path: 'invoices/:id/edit',
                lazy: () => import('./pages/InvoiceEditPage.tsx').then((m) => ({ Component: m.InvoiceEditPage })),
              },
              { path: 'users', lazy: () => import('./pages/UsersPage.tsx').then((m) => ({ Component: m.UsersPage })) },
              {
                path: 'users/new',
                lazy: () => import('./pages/UserCreatePage.tsx').then((m) => ({ Component: m.UserCreatePage })),
              },
              {
                path: 'users/:id',
                lazy: () => import('./pages/UserDetailPage.tsx').then((m) => ({ Component: m.UserDetailPage })),
              },
              {
                path: 'users/:id/edit',
                lazy: () => import('./pages/UserEditPage.tsx').then((m) => ({ Component: m.UserEditPage })),
              },
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
