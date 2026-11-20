# Plan técnico — Spec 02

Cómo se implementa [`spec.md`](spec.md) respetando la [constitución](../constitution.md).
Patrones de código: `.claude/skills/react-rules/references/patterns.md`.

## 1. Generación y configuración

- `bash .claude/skills/react-rules/scripts/create_project.sh .` (requiere Node ≥ 22.22). No sobrescribe `CLAUDE.md`, `README.md`, `.claude/` ni `specs/`.
- `vite.config.ts`: agregar `server: { proxy: { '/api': 'http://localhost:8080' } }`.
- `.env.example`: `VITE_API_URL=` (vacía = mismo origen).

## 2. Cliente HTTP (`src/lib/http.ts`)

Se extiende la plantilla de la skill:

```ts
type AuthHandlers = { onRefreshed: (user: User) => void; onSessionExpired: () => void }
export function setAuthHandlers(handlers: AuthHandlers): void

export class HttpError extends Error { status; title?; detail?; fieldErrors?: Record<string, string> }

export const http = {
  get, post, put, delete,              // validan la respuesta con un esquema Zod
  download(path, accept): Promise<{ blob: Blob; filename: string }>,
}
```

- `credentials: 'include'` siempre; `Accept: application/json` salvo en `download`.
- CSRF: en `POST` / `PUT` / `PATCH` / `DELETE`, salvo `/api/auth/login`, se lee la cookie `XSRF-TOKEN` en cada petición; si no existe, `GET /api/auth/csrf` antes.
- Errores: `problemDetailSchema.safeParse(body)` → `HttpError` con `title`, `detail` y `fieldErrors` (de `errors`).
- 401 (excepto en `/api/auth/*`):

  ```ts
  let refreshing: Promise<User | null> | null = null
  function refreshOnce() {
    refreshing ??= doRefresh().finally(() => { refreshing = null })
    return refreshing
  }
  ```

  `refreshOnce()` llama a `handlers.onRefreshed(user)` o a `handlers.onSessionExpired()` **una sola vez por renovación** (dentro de la promesa compartida), aunque esperen varias peticiones. Con usuario, cada petición se reintenta una vez; sin usuario, se propaga el 401. `/api/auth/me` sí renueva (al recargar la app con el access token vencido); login, refresh, logout y csrf no. Compartir la promesa es obligatorio: dos `/refresh` paralelos con la misma cookie se detectan como reuso y el backend revoca todas las sesiones.
- 403 con `title === 'Token CSRF inválido'` → `GET /api/auth/csrf` y un reintento. Otros 403 se propagan.
- `download`: mismo flujo; nombre desde `Content-Disposition` (`filename*=UTF-8''…` o `filename=`).

Archivos de soporte:

| Archivo | Contenido |
|---|---|
| `src/schemas/common.ts` | `pageMetaSchema`, `pagedSchema(item)` (`{content, page:{size, number, totalElements, totalPages}}`), `problemDetailSchema` |
| `src/schemas/user.ts` | `roleSchema = z.enum(['USER', 'ADMIN'])`, `userSchema` (`id`, `email`, `role`, `enabled`, `createdAt?`, `updatedAt?` nullable) |
| `src/services/authService.ts` | `csrf()`, `login(values)`, `refresh()`, `logout()`, `me()` |
| `src/lib/query.ts` | `toQuery(params)`: arma el query string omitiendo valores vacíos |
| `src/lib/queryClient.ts` | `retry` sin reintentar 4xx (`!(error instanceof HttpError && error.status < 500) && count < 1`) |

## 3. Dirección visual (B-04)

1. Usar la skill `frontend-design`: sujeto (back-office de clientes y usuarios), audiencia, trabajo principal de la pantalla.
2. Escribir el plan en `design.md` (en esta carpeta; lo crea B-04): 4–6 colores con nombre y hex, tipografía y roles, layout con wireframe ASCII, alineación, principios, y la revisión contra los "defaults" que la skill pide evitar.
3. **Pausa para aprobación del usuario.** Solo después se implementa.
4. Tokens en `src/index.css`:

   ```css
   @import 'tailwindcss';
   @theme {
     --color-…: …;        /* paleta aprobada */
     --font-sans: …;      /* familia aprobada */
     --radius-…: …;       /* radios por jerarquía */
   }
   ```

   Fuente con `@fontsource/<familia>` importada en `main.tsx`.

Punto de partida propuesto en el plan wizard (a revisar en `design.md`): fondo gris niebla,
superficie blanca, tinta pizarra, primario azul Pacífico, peligro y éxito sobrios; una
sola familia sans con cifras tabulares para tablas.

## 4. Layout

```
┌ Header: marca │ Resumen  Clientes  Usuarios(ADMIN) │ usuario · rol ▾ ┐
├ [región de mensajes flash, fija arriba]                               ┤
│ ┌ aside filtros ┐  PageHeader (h1 + acciones)                         │
│ │ colapsable    │  contenido (tabla, formulario, detalle)            │
│ └───────────────┘                                                     │
├ Footer                                                                 ┤
```

- La navegación principal va en el header; el `aside` izquierdo es **solo** para filtros (cada página decide si lo muestra).
- Contenido en `max-w-screen-2xl` (más ancho que la plantilla, por las tablas).
- `NAV_ITEMS` con `roles` para filtrar por rol (el rol llega en la spec 03; hasta entonces se muestran todos).

| Archivo | Contenido |
|---|---|
| `src/components/layout/AppLayout.tsx` | reemplaza `Layout.tsx`: header, `FlashMessages`, `main` con `<Outlet />`, footer |
| `src/components/layout/AuthLayout.tsx` | layout centrado para el login |
| `src/components/layout/Header.tsx`, `Navbar.tsx`, `Footer.tsx` | adaptados de la plantilla |
| `src/components/ui/*.tsx` | `Button` (variantes `primary`, `secondary`, `danger`, `ghost`; estado `isPending`), `Input`, `Select`, `FormField`, `Badge`, `Spinner`, `EmptyState`, `PageHeader` |
| `src/pages/DevUiPage.tsx` | ruta `/dev/ui` solo con `import.meta.env.DEV` para revisar los componentes; se elimina en F-04 |

## 5. Mensajes flash

```ts
// src/stores/flashStore.ts
type FlashType = 'success' | 'error' | 'info'
type Flash = { id: string; type: FlashType; text: string; duration: number }
type FlashState = {
  messages: Flash[]
  push: (flash: { type: FlashType; text: string; duration?: number }) => void  // duration = 5000
  dismiss: (id: string) => void
}
```

- `push` genera el id con `crypto.randomUUID()` dentro de la acción y conserva los 3 más recientes (copias, sin mutar).
- Se llama desde handlers u `onSuccess` / `onError` de mutaciones, nunca desde effects. Helper `flash.success(text)` / `flash.error(text)` exportado desde el store para usarlo fuera de componentes.
- `FlashMessages.tsx`: región fija arriba (`aria-live` implícito por el `role` de cada mensaje).
- `FlashMessage.tsx`: un `useEffect` con `setTimeout(() => dismiss(id), duration)` y limpieza (un timer es un sistema externo); estado `paused` (hover / focus) como dependencia: al pausar se limpia el timer y al reanudar se reinicia. Botón X con `aria-label="Cerrar mensaje"`. Animación de entrada solo si no hay `prefers-reduced-motion`.

## 6. Modal de confirmación

```tsx
type ConfirmDialogProps = {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel?: string        // "Confirmar" por defecto, o el verbo de la acción ("Eliminar")
  cancelLabel?: string         // "Cancelar"
  tone?: 'default' | 'danger'
  isPending?: boolean
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}
```

- `<dialog>` nativo: un `useEffect` sincroniza `open` con `showModal()` / `close()` (sincronización con el DOM), comprobando `dialog.open` para tolerar el doble montaje de `StrictMode`.
- `showModal()` da el foco atrapado y el fondo inerte; el evento `cancel` (Esc) llama a `onCancel` (con `preventDefault` si `isPending`).
- `aria-labelledby` (título) y `aria-describedby` (descripción); foco inicial en Cancelar (`autoFocus`).
- El padre controla `open` con estado local (`const [toDelete, setToDelete] = useState<Customer | null>(null)`); el modal no conoce la mutación.

## 7. Sidebar de filtros

```ts
// src/stores/uiStore.ts (persist, name: 'ui')
type UiState = { filtersOpen: boolean; toggleFilters: () => void; setFiltersOpen: (open: boolean) => void }
```

- `src/components/filters/FiltersSidebar.tsx`: `<aside aria-label="Filtros">` con botón `aria-expanded` / `aria-controls`; colapsado deja una franja con el botón para reabrirlo. Recibe los campos como `children` (cada página pone los suyos) y una acción opcional "Limpiar filtros".
- `src/components/filters/FiltersLayout.tsx`: grid `aside + contenido` que usan las páginas con filtros.
- Móvil (< `lg`): el botón abre un drawer (`<dialog>` lateral) con los mismos `children`.

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Node 22.21 < 22.22 | Actualizar antes de B-01. |
| Refresh concurrente revoca sesiones | Promesa compartida obligatoria (`refreshOnce`). |
| Doble montaje de `StrictMode` abre y cierra el `<dialog>` | Comprobar `dialog.open` antes de `showModal()` / `close()`. |
| Plan visual genérico | Revisión explícita contra los "defaults" de `frontend-design` en `design.md`. |

## 9. Trazabilidad

| Requisito | Tareas |
|---|---|
| RF-02-01 | B-01 |
| RF-02-02 | B-01 |
| RF-02-03 | B-02 |
| RF-02-04 | B-03 |
| RF-02-05 | B-03 |
| RF-02-06 | B-04 |
| RF-02-07 | B-05 |
| RF-02-08 | B-06 |
| RF-02-09 | B-07 |
| RF-02-10 | B-08 |
| RF-02-11 | B-05 |
| RF-02-12 | B-01, B-09 |
| RNF-02-01 | B-05, B-06, B-07, B-08 |
| RNF-02-02 | B-03 |
| RNF-02-03 | B-04 |
