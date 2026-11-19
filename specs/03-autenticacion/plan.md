# Plan técnico — Spec 03

Cómo se implementa [`spec.md`](spec.md) respetando la [constitución](../constitution.md).

## 1. Contrato usado

| Endpoint | Uso |
|---|---|
| `POST /api/auth/login` `{email, password}` | 200 `UserDto`; 401 "Email o contraseña incorrectos"; sin CSRF |
| `GET /api/auth/me` | 200 `UserDto`; 401 sin sesión (dispara refresh); 404 se trata como sesión inválida |
| `POST /api/auth/refresh` | lo usa solo `lib/http.ts` (spec 02) |
| `POST /api/auth/logout` | 204; requiere CSRF |

`UserDto`: `{id, email, role: 'USER' | 'ADMIN', enabled, createdAt, updatedAt}`.

## 2. Estado de sesión

```ts
// src/stores/authStore.ts — sin tokens, sin persist
type AuthStatus = 'checking' | 'authenticated' | 'anonymous'
type AuthState = {
  user: User | null
  status: AuthStatus
  setUser: (user: User) => void      // status = 'authenticated'
  clear: () => void                  // user = null, status = 'anonymous'
}
```

```ts
// src/lib/session.ts
export function initSession(): void  // authService.me() → setUser | clear (401 tras refresh fallido o 404)
```

`src/main.tsx` (orden, una sola vez al cargar el módulo):

1. `setAuthHandlers({ onRefreshed: setUser, onSessionExpired })`, donde `onSessionExpired` hace `clear()`, `queryClient.clear()` y `flash.info('Tu sesión expiró, inicia sesión de nuevo')`.
2. `initSession()`.
3. `createRoot(...).render(...)`.

Así no hay `useEffect` de arranque (patrón "inicializar la app una sola vez" de `react-rules`).

## 3. Hooks y componentes

| Archivo | Contenido |
|---|---|
| `src/schemas/auth.ts` | `loginSchema = z.object({ email: z.email('…'), password: z.string().min(1, '…') })` |
| `src/hooks/useAuth.ts` | `useAuth()` → `{ user, status, isAdmin }`; `useLogin()` (mutación: `queryClient.clear()`, `setUser`, `navigate(from ?? '/')`); `useLogout()` (mutación: en `onSettled` limpia store y cache, `navigate('/login')`, flash "Sesión cerrada") |
| `src/components/auth/LoginForm.tsx` | presentacional: recibe `onSubmit`, `isPending` y `error` |
| `src/components/auth/RequireAuth.tsx` | `checking` → spinner a pantalla completa; `anonymous` → `<Navigate to="/login" state={{ from: location }} replace />`; si no, `<Outlet />` |
| `src/components/auth/RequireRole.tsx` | `role="ADMIN"`; si no corresponde → `<Navigate to="/forbidden" replace />` |
| `src/components/layout/UserMenu.tsx` | email, `Badge` con el rol y botón "Cerrar sesión" (usa `useLogout`) |
| `src/pages/LoginPage.tsx` | si ya hay sesión → `<Navigate to="/" replace />`; lee `location.state.from` |
| `src/pages/ForbiddenPage.tsx`, `src/pages/NotFoundPage.tsx` | mensajes y enlace al inicio |

## 4. Rutas (`src/App.tsx`)

```tsx
createBrowserRouter([
  { element: <AuthLayout />, children: [{ path: '/login', element: <LoginPage /> }] },
  {
    element: <RequireAuth />,
    errorElement: <RouteErrorPage />,
    children: [{
      element: <AppLayout />,
      children: [
        { index: true, element: <HomePage /> },          // DashboardPage en la spec 06
        // clientes (spec 04): lectura para todos; escritura dentro de <RequireRole role="ADMIN" />
        // usuarios (spec 05): todo dentro de <RequireRole role="ADMIN" />
        { path: 'forbidden', element: <ForbiddenPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    }],
  },
])
```

`Navbar` filtra `NAV_ITEMS` por `useAuth().user.role`.

## 5. Decisiones

| Decisión | Motivo |
|---|---|
| Sin tokens ni `persist` en `authStore` | Los tokens viven en cookies `HttpOnly`; el usuario se recupera con `/me`. |
| `queryClient.clear()` en login, logout y sesión expirada | Evita mostrar datos cacheados de otro usuario o de otro rol. |
| `onRefreshed` actualiza el usuario | Si un ADMIN fue degradado, el refresh trae el rol nuevo y la UI oculta lo que ya no puede usar. |
| `from` en `location.state` | Volver a la ruta original tras el login sin poner datos en la URL. |

## 6. Riesgos

| Riesgo | Mitigación |
|---|---|
| Cookies `Secure` sobre http en local (Safari) | `JWT_COOKIE_SECURE=false` en el `.env` local del backend, o probar en Chrome. |
| `/me` responde 404 tras cambiar el propio email | Se trata como sesión inválida; la spec 05 hace refresh tras ese cambio. |

## 7. Trazabilidad

| Requisito | Tareas |
|---|---|
| RF-03-01 | C-02 |
| RF-03-02 | C-01 |
| RF-03-03 | C-03 |
| RF-03-04 | C-03 |
| RF-03-05 | C-03 |
| RF-03-06 | C-01, C-04 |
| RF-03-07 | C-03 |
| RF-03-08 | C-03 |
| RF-03-09 | C-04 |
| RNF-03-01 | C-01 |
| RNF-03-02 | C-02 |
