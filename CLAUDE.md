# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Frontend React + TypeScript del curso. Es parte de un curso: el código se muestra en pantalla y se publica en GitHub.

Proyecto generado con el script de la skill `react-rules` (Vite + React 19.3.1 + TypeScript 7 + Tailwind 4); no lo vuelvas a ejecutar. `vite.config.ts` reenvía `/api` a `http://localhost:8080`. Las pantallas se construyeron por fases según `specs/` (todas hechas, hasta la 09; ver abajo).

## Recursos: documentación del backend

El frontend consume la API REST de Spring Boot del proyecto hermano `../3-spring-api`. Toda su documentación está en estos dos archivos; **léelos antes de** crear esquemas Zod, servicios o hooks de datos, de implementar login/sesión o de manejar errores de la API. No inventes endpoints, campos ni reglas: si algo no está documentado ahí, revisa el código del backend o pregunta.

| Recurso | Qué contiene |
|---|---|
| [`../3-spring-api/README.md`](../3-spring-api/README.md) | Stack y puesta en marcha (PostgreSQL con Docker, variables de entorno), seguridad y roles (`USER` / `ADMIN`), autenticación en `/api/auth` (cookies `access_token`, `refresh_token` y `XSRF-TOKEN`, ejemplos con curl), endpoints de `/api/customers` y `/api/users` con ejemplos de request/response, formatos de exportación (content negotiation), formato de errores (`ProblemDetail`) y estructura del proyecto. |
| [`../3-spring-api/CLAUDE.md`](../3-spring-api/CLAUDE.md) | Guía técnica del backend: comandos para levantarlo (`./mvnw -DskipTests spring-boot:run`), configuración (`.env`), arquitectura en capas y DTOs, reglas de acceso de `SecurityConfig`, detalles de JWT en cookies `HttpOnly`, CSRF, rotación del refresh token y los listados paginados con filtros (`CustomerFilter`, `UserFilter`, `Pageables`). |

Puntos que afectan directamente al frontend (detalle en esos archivos):

- La API corre en `http://localhost:8080`; en desarrollo usa el proxy de Vite para `/api` (mismo origen, cookies `SameSite=Strict` sin CORS).
- La sesión va en cookies `HttpOnly`: JavaScript no lee ni guarda tokens. Las peticiones llevan `credentials: 'include'` y las escrituras la cabecera `X-XSRF-TOKEN` con el valor de la cookie `XSRF-TOKEN`.
- Los errores llegan como `ProblemDetail` (`title`, `detail`, `status`); la validación agrega `errors` (campo → mensaje), útil para `setError` en React Hook Form.
- Si el backend cambia (endpoints, campos de un DTO, reglas de seguridad), actualiza los esquemas Zod y servicios del frontend en el mismo cambio.
- Los listados `GET /api/customers` y `GET /api/users` en JSON son **paginados** (`{content, page:{size, number, totalElements, totalPages}}`, `page` desde 0, `size` máx. 100, `sort=campo,asc|desc` con lista blanca) y aceptan filtros; `GET /api/customers?format=csv|xlsx|pdf|xml` exporta todo el resultado filtrado. Usa `pagedSchema(item)` de `src/schemas/common.ts`.

## Arquitectura del frontend (piezas compartidas)

- **`src/lib/http.ts`** es el único lugar que llama a `fetch`: `credentials: 'include'`, cabecera CSRF en escrituras (pide `/api/auth/csrf` si falta la cookie), respuestas validadas con Zod y errores como `HttpError` (`status`, `title`, `detail`, `fieldErrors`). Ante un 401 usa **`refreshOnce`**: una sola promesa de `POST /api/auth/refresh` compartida por todas las peticiones; no la reemplaces por refresh paralelos (el backend rota el refresh token y revocaría todas las sesiones). Un 403 "Token CSRF inválido" renueva el token y reintenta una vez. `http.download()` para exportaciones.
- **`setAuthHandlers({ onRefreshed, onSessionExpired })`**: `lib/` no importa stores ni el router; la app registra en `main.tsx` qué hacer cuando la sesión se renueva o expira (se avisa una vez por renovación): `onRefreshed` actualiza el usuario (y su rol) y `onSessionExpired` limpia sesión y caché y, si había sesión, muestra el flash «Tu sesión expiró…».
- **Sesión** (spec 03): `authStore` guarda `user`, `status` (`checking` | `authenticated` | `anonymous`) y `loggedOut`, nunca tokens ni `persist`. `initSession()` (`src/lib/session.ts`) corre una vez a nivel de módulo en `main.tsx`. En componentes usa `useAuth()` → `{ user, status, isAdmin }`; `useLogin()` y `useLogout()` no navegan: `LoginPage` redirige al ver `authenticated` y `RequireAuth` al ver `anonymous` (con la ruta de origen en `location.state.from`, salvo tras «Cerrar sesión»). Las rutas de un rol van dentro de `<RequireRole role="ADMIN" />` (redirige a `/forbidden`); los enlaces del menú, en `NAV_ITEMS` con `roles`. Al iniciar o cerrar sesión, o al expirar, se hace `queryClient.clear()`. Flujo completo y cómo probar la renovación en el README («Flujo de sesión»).
- **Listados con filtros (clientes y usuarios)**: la **URL es la única fuente de verdad** de filtros, orden, tamaño y página. `useUrlFilters(schema, config)` (`src/hooks/useUrlFilters.ts`) lee `useSearchParams` con el esquema del listado (cada campo con `.catch()`: un parámetro inválido cae a su valor por defecto; `pageParam`, `sizeParam` y `sortParam` en `schemas/common.ts`); `useCustomerFilters` y `useUserFilters` solo aportan esquema y `config` (`textFields`, `cleared`, `countActive`, constantes de módulo). `setFilters(patch)` escribe la URL: cualquier cambio que no sea de página vuelve a la página 1, los valores por defecto no se escriben y el texto agrega una entrada al historial en el primer cambio y la reemplaza en los siguientes (`state.textEdit`). La página va desde 1 en la URL y desde 0 en la API (la conversión vive solo en `page` de cada servicio). Los campos de texto usan `useDebouncedText` (el buscador, `SearchField`) (debounce en el handler, ajuste en el render si cambia la URL) y la página les pone `key={resetKey}` para que «Limpiar filtros» descarte lo que se estaba escribiendo. No dupliques los filtros en Zustand ni en `useState`.
- **Datos de clientes**: `customerKeys` (`all`, `list(filters)`, `detail(id)`); `useCustomersPage` con `keepPreviousData` (`isPlaceholderData` → `DataTable isDimmed`); las mutaciones publican el flash e invalidan `customerKeys.all` en `onSuccess` y la página navega en el `onSuccess` de `mutate`. Formularios: `applyServerErrors(error, setError, { fields, conflict })` (`src/lib/serverErrors.ts`) pone los 400 por campo y el 409 en el campo indicado; si devuelve `false`, flash de error con `errorMessage(error, fallback)` (`src/lib/errors.ts`). Fechas: `formatDate` (LocalDate sin `new Date()`, que en Chile mostraría el día anterior) y `formatDateTime` (`es-CL`), en `src/lib/format.ts`. Exportación: `http.download` + `saveFile`, nunca un `<a href>` directo a la API. Para volver al listado con sus filtros, los enlaces llevan `state={{ listSearch: location.search }}` y las pantallas usan `useListPath('/customers')` (o `'/users'`). Enlaces con aspecto de botón: `buttonClassName({ variant })`.
- **Usuarios (spec 05)**: `userKeys` (`all`, `list`, `detail`, `activeAdmins`). **Reglas de administradores** en `src/lib/userRules.ts`, funciones puras `roleChangeRule`, `statusChangeRule` y `deleteRule(user, me, activeAdmins)` → `{ allowed }` o `{ allowed: false, reason }`: promover y habilitar siempre; degradar, deshabilitar y eliminar se bloquean sobre uno mismo (`SELF_REASON`, tiene prioridad) y sobre el último ADMIN habilitado (`LAST_ADMIN_REASON`). `useActiveAdminCount()` pide `role=ADMIN&enabled=true&size=1` y usa `page.totalElements` (no trae la lista). La UI solo anticipa: el backend decide con 409 y las mutaciones invalidan `userKeys.all` también tras un error. `useUserActions({ onDeleted })` (tabla y ficha) decide qué pide confirmación (eliminar, degradar o deshabilitar a un ADMIN), ejecuta `useChangeUser` (PUT completo con un campo cambiado) / `useDeleteUser` y entrega `dialogProps` para `ConfirmDialog`; `UserActions` muestra los botones con el motivo en `aria-describedby`. En formularios de usuario, `conflict.title: 'Recurso duplicado'`: solo ese 409 va al campo email (los de reglas, al modal o a un flash). **Propio usuario** (en `useUpdateUser`): si cambia su email, `await refreshSession()` (`lib/http.ts`, misma promesa que `refreshOnce`) **antes** de invalidar datos, porque el JWT trae el email anterior y un refresh aparte podría ir en paralelo con el de un 401 (el backend lo toma como reuso y revoca todo); si cambia su contraseña, `authService.logout()` (borra cookies), `queryClient.clear()`, `clear({ loggedOut: true })` y flash.
- **`flashStore`** (`src/stores/flashStore.ts`): mensajes flash globales (máx. 3, 5 s). Publícalos con `flash.success/error/info(texto)` desde handlers u `onSuccess` / `onError` de mutaciones, nunca desde un `useEffect` que observa datos. La región (`FlashMessages`) está en `AppLayout` y en `AuthLayout`.
- **`ConfirmDialog`** (`src/components/ui/`): toda eliminación o acción destructiva lo usa (nunca `confirm()`). El padre controla `open` con estado local y le pasa `isPending` y `error` de la mutación; `tone="danger"` y `confirmLabel` con el verbo ("Eliminar").
- **`FiltersLayout`** (`src/components/filters/`): `filters` (campos), `activeCount`, `onClear` y el contenido como `children`. Desde `lg` muestra `FiltersSidebar` (colapsable, estado en `uiStore` persistido); en pantallas chicas, `FiltersDrawer`.
- **Hooks**: `useModalDialog(open, initialFocusRef)` sincroniza un `<dialog>` modal (lo usan `ConfirmDialog` y el cajón); `useMediaQuery(query)` con `useSyncExternalStore`.
- **Componentes base** en `src/components/ui/`: `Button` (variantes, `isPending`, acepta `ref`), `Input`, `Select`, `FormField` (recibe el campo como función: `{(field) => <Input {...field} />}`, así asocia etiqueta, ayuda y error), `Badge` (estado y rol en minúscula de oración: «Administrador» / «Usuario»), `Spinner`, `EmptyState`, `PageHeader` (el `h1` de cada página), `TableSkeleton` (primera carga de una tabla), `DataTable` (columnas `{ key, header, cell, sortField?, className?, minWidth? }`, `sort` y `onSortChange` en formato de la API `campo,asc`, `isDimmed`, `empty`), `Pagination` (página desde 1, `sizes`) e `IconButton` / `IconLink` (`label` obligatorio, `icon` de `lucide-react`, `tone` `neutral` / `danger` / `band`, `isPending`).
- **Páginas** (spec 06): cada página llama arriba a `useDocumentTitle('Clientes')` (título de la pestaña «Clientes · Cartera», también mientras carga) y usa `PageHeader` para su único `h1`, que recibe el foco al llegar a la pantalla (solo cuando cambia la ruta, no el query string; no en la carga inicial). Primera carga de una tabla: `TableSkeleton`; con datos previos: `DataTable isDimmed`. Estados vacíos con acción; si son toda la página (no encontrado, error al cargar), `EmptyState titleAs="h1"`. El resumen (`DashboardPage`) usa `useDashboardStats`: consultas `size=1` con las mismas claves que los listados (se actualiza solo tras las mutaciones). Accesibilidad verificada con Lighthouse (100 en login, clientes y usuarios): mantén los nombres accesibles, `aria-describedby` en ayudas y errores, y `motion-safe` / `motion-reduce` en las animaciones.
- **Fase 07 (rendimiento e interfaz)**:
  - **Rutas**: cada página con `lazy` del router en `App.tsx` (`lazy: () => import('./pages/X.tsx').then((m) => ({ Component: m.X }))`); layouts, guardas y páginas mínimas quedan en el chunk inicial; `hydrateFallbackElement` para la primera carga y `NavigationProgress` (`useNavigation`) al navegar. Las librerías van en chunks propios (`codeSplitting.groups` en `vite.config.ts`). Una página nueva se agrega con `lazy`, no con import estático.
  - **Acciones**: siempre `IconButton` (acción) o `IconLink` (navega) con un `label` que nombre el objeto («Eliminar a Ana Pérez»); el tooltip va a la izquierda (las tablas tienen scroll propio). Exportar es `ExportMenu`: un `popover` nativo con `popoverTarget` (Esc y clic fuera sin effects) y anchor positioning. Las acciones principales de página siguen con texto.
  - **Tablas**: el contenedor de `DataTable` es `@container`; una columna secundaria declara `minWidth` (`'md'`…`'5xl'`) y se oculta si el contenedor es más angosto, así se adapta al sidebar sin JavaScript. Fechas de tabla con `formatDay` (solo el día); emails con `truncate` + `title`. Al agregar una columna, mide y elige su `minWidth` para que no vuelva el scroll horizontal (medidas en `specs/07-rendimiento-interfaz/plan.md`).
  - **Paginación**: `pageWindow(actual, total, radio)` en `lib/pagination.ts` (pura); radio 3 y 1 en móvil con clases `hidden sm:block`.
  - **Tema**: los tokens se redefinen en `:root[data-theme='dark']` de `index.css`; nunca clases `dark:` por color ni colores fijos (usa `band`, `on-primary`, `on-danger`, `scrim`, `shadow-popover`, `shadow-dialog`). `uiStore.theme` (`'system'` | `'light'` | `'dark'`, persistido); `lib/theme.ts` lo aplica (desde `main.tsx`, sin `useEffect`) y el script de `index.html` evita el destello. Un color nuevo se agrega en los dos temas y con su contraste medido (`design.md` §8).
- **Fase 08**: «Cerrar sesión» es un `IconButton` (`LogOut`, tono `band`) en `UserMenu`; cada `StatRow` del resumen recibe `icon` (recuadro `bg-accent-soft text-accent-strong`, decorativo); el detalle del cliente exporta su ficha con `useExportCustomerPdf` → `customerService.exportPdf(id)` (`GET /api/customers/{id}?format=pdf`, solo PDF, un `IconButton` sin menú).
- **Fase 09 (despliegue)**: el frontend irá a Vercel y el backend a Render (Docker, base en Supabase). `vercel.json` reenvía `/api/*` a `https://cartera-api-huv3.onrender.com` (mismo origen para el navegador, como el proxy de Vite) y hace fallback a `index.html`. `VITE_API_URL` queda vacía: nunca llames a la API en otro dominio (las cookies `SameSite=Strict` no viajarían y no hay CORS). Si cambia la URL de Render, se cambia solo en `vercel.json`.
- **Estilos**: solo tokens del `@theme` de `src/index.css` (dirección visual en `specs/02-base-frontend/design.md`, tema oscuro en su §8); el acento (`accent`: ámbar en claro, lavanda en oscuro) nunca como color de texto (usa `accent-strong`). Las piezas nuevas se revisan en las pantallas reales (el catálogo `/dev/ui` se eliminó al cerrar el SDD).

## Desarrollo guiado por especificaciones (SDD)

El dashboard (frontend) y los cambios que necesitó en el backend se construyeron con SDD, en formato estilo Spec Kit (solo Markdown). Índice y estado de las fases: [`specs/README.md`](specs/README.md). **Las nueve fases están hechas**; una funcionalidad nueva se agrega como una fase nueva (`specs/10-…/` con su `spec.md`, `plan.md` y `tasks.md`) respetando la constitución.

- `specs/constitution.md` (frontend) y `../3-spring-api/specs/constitution.md` (backend): reglas que no se negocian.
- Cada fase tiene `spec.md` (qué y por qué: historias, criterios de aceptación, `RF-NN-xx`), `plan.md` (cómo: contrato, decisiones, archivos, trazabilidad) y `tasks.md` (tareas con checkbox, dependencias, verificación y mensaje de commit).
- Orden: 01 backend (`../3-spring-api/specs/01-paginacion-filtros-admin/`, tareas `A-xx`) → 02 base (`B-xx`) → 03 autenticación (`C-xx`) → 04 clientes (`D-xx`) → 05 usuarios (`E-xx`) → 06 pulido (`F-xx`) → 07 rendimiento e interfaz (`G-xx`) → 08 iconos y ficha en PDF (`H-xx`) → 09 Docker y nube (`../3-spring-api/specs/09-docker-despliegue/`, tareas `I-xx` en ambos repos). Las fases 02 y 03 no dependen del backend nuevo; la 04 necesita A-06 y la 05 necesita A-09 y A-10.
- Las tareas se ejecutan **una a una** con la skill `sdd-next-task`: implementar, verificar, marcar `[x]`, commit en el repo de la tarea y pausa para revisión. Sin push ni merge a `main` sin el OK del usuario al cerrar cada fase.
- Si la implementación se desvía de la spec, se actualiza `spec.md` / `plan.md` en el mismo commit.

## Comandos

Una vez generado el proyecto:

```bash
npm run dev       # servidor de desarrollo en http://localhost:5173
npm run build     # tsc -b (tipos) + build de producción
npm run lint      # oxlint (rules-of-hooks, exhaustive-deps)
npm run preview   # sirve el build
```

## Available skills

| Skill | Ubicación | Propósito |
|---|---|---|
| `react-rules` | `.claude/skills/react-rules/` | Genera proyectos React con TypeScript (React 19.3.1+, Vite, Tailwind CSS 4, React Router) con estructura pages / components / hooks / stores / schemas / services, y aplica las Reglas de React: Zustand para estado global, Zod para validar, React Hook Form + Zod en formularios, TanStack Query para datos de API, `useEffect` solo para sistemas externos y layout semántico `header` / `nav` / `main` / `footer`. |
| `frontend-design` | `.claude/skills/frontend-design/` | Dirección visual intencional y distintiva para UI nueva o rediseños: paleta, tipografía, layout, movimiento y textos de la interfaz, evitando el aspecto de plantilla genérica. Trabaja en dos pasadas: plan de diseño (tokens de color, tipografía, layout, principios) revisado contra el brief y luego el código, con autocrítica final. |

| `sdd-next-task` | `.claude/skills/sdd-next-task/` | Ejecuta el SDD tarea por tarea: lee el índice `specs/README.md`, la constitución, la spec, el plan y el `tasks.md` de la fase (frontend o backend), toma la siguiente tarea pendiente con dependencias hechas (o la pedida por ID), la implementa, la verifica, marca el checkbox, hace commit y se detiene para revisión. |

`frontend-design` viene del repositorio `anthropics/skills` y se instaló con el CLI de skills: el original vive en `.agents/skills/frontend-design/`, `.claude/skills/frontend-design` es un **symlink** a esa carpeta y la versión (commit y hash) queda fijada en `skills-lock.json`. No edites sus archivos a mano: se reemplazan al actualizarla.

## Skill trigger rules

Usa `react-rules` cuando el usuario:

- Pida crear una aplicación o proyecto React (el workspace aún no tiene `package.json` → genera con `bash .claude/skills/react-rules/scripts/create_project.sh .`).
- Pida crear, agregar o modificar un componente, página o layout de React.
- Pida crear o modificar hooks o custom hooks (`useAuth`, `useFetch`, `useProducts`...).
- Pida agregar o cambiar estado: `useState`, estado global, un store de Zustand.
- Pida crear o modificar formularios o validaciones (React Hook Form, Zod).
- Pida consumir una API, mostrar datos remotos o agregar cache/refetch (TanStack Query).
- Pida escribir, revisar o corregir un `useEffect` u otra lógica de UI en React / TSX.

Reglas clave de la skill en este proyecto:

- TypeScript siempre (`.ts` / `.tsx`), sin `any`; los tipos de datos salen de esquemas Zod con `z.infer`.
- Datos de la API en TanStack Query, estado de cliente compartido en Zustand; nunca `useEffect` + `fetch`.
- Nada de `useEffect` para estado derivado ni para lógica de eventos; nunca mutar estado ni props.
- Antes de terminar un cambio: `npm run build` y `npm run lint` sin errores.

Usa `frontend-design` cuando el usuario:

- Pida diseñar o rediseñar el aspecto visual de una página, pantalla, landing, layout o componente (colores, tipografía, estilo, "que se vea mejor / más profesional / más moderno").
- Pida crear una UI nueva donde la apariencia importa (página de inicio, dashboard, login, header/navbar/footer con identidad propia).
- Pida definir o cambiar la paleta, las fuentes, el espaciado, las animaciones o los textos de la interfaz (botones, mensajes de error, estados vacíos).

Usa `sdd-next-task` cuando el usuario:

- Diga "siguiente tarea", "continúa con el SDD", "sigue con la spec" o "avanza con la fase".
- Pida ejecutar una tarea por su ID (`A-04`, `B-01`, `D-03`…).
- Pregunte qué tarea sigue o en qué estado están las specs.

Al ejecutar una tarea, `sdd-next-task` carga además `react-rules` / `frontend-design` (frontend) o `spring-boot-best-practices` (backend) según lo que toque la tarea.

Cómo se combinan `react-rules` y `frontend-design`:

- En una UI nueva se usan **ambas**: `react-rules` manda en la estructura, el stack, el layout semántico y las reglas de React; `frontend-design` manda en la dirección visual (paleta, tipografía, composición, copy).
- Los tokens del plan de diseño se implementan con Tailwind CSS 4: colores y fuentes en un bloque `@theme` de `src/index.css` y se usan como clases (`bg-primary`, `font-display`), no con CSS suelto por componente. La paleta `slate` de la plantilla base es solo un punto de partida neutro.
- Cambios que no son visuales (hooks, estado, formularios, llamadas a la API, `useEffect`) usan solo `react-rules`.
- Calidad mínima en cualquier diseño: responsive hasta móvil, foco visible con teclado, `prefers-reduced-motion` respetado y contraste accesible.
