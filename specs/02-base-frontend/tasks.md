# Tareas — Spec 02 (Fase B)

Se ejecutan **una a una** con la skill `sdd-next-task`. Cada tarea: implementar →
verificar → marcar `[x]` → commit en `4-react` → pausa para revisión. Definición de
"hecho" en la [constitución](../constitution.md#6-calidad-definición-de-hecho).

- [x] **B-01** Crear la rama, generar el proyecto y configurar el proxy
  - Depende de: — (prerrequisito: Node ≥ 22.22)
  - Cubre: RF-02-01, RF-02-02, RF-02-12
  - Archivos: proyecto generado por `create_project.sh`, `vite.config.ts`, `.env.example`, `README.md` (quitar el aviso "aún no está generado"), `CLAUDE.md` (sección Proyecto: ya hay `package.json`)
  - Hecho cuando: existe la rama `feature/dashboard`; `react` ≥ 19.3.1; el proxy reenvía `/api` al backend
  - Verificación: `npm run build && npm run lint`; con `npm run dev` y el backend arriba, `curl -i localhost:5173/api/auth/csrf` → 200 con `Set-Cookie: XSRF-TOKEN`
  - Commit: "Genera el proyecto React y configura el proxy hacia la API"

- [x] **B-02** Cliente HTTP con cookies, CSRF y errores ProblemDetail
  - Depende de: B-01
  - Cubre: RF-02-03
  - Archivos: `src/lib/http.ts`, `src/schemas/common.ts`, `src/lib/query.ts`, `src/lib/queryClient.ts`
  - Hecho cuando: todas las peticiones usan `credentials: 'include'`; las escrituras (salvo login) llevan `X-XSRF-TOKEN` y piden `/api/auth/csrf` si falta la cookie; los errores son `HttpError` con `fieldErrors`; existen `pagedSchema` y `problemDetailSchema`; `queryClient` no reintenta 4xx
  - Verificación: `npm run build && npm run lint`; en la consola del navegador (dev) un `POST` sin sesión lleva la cabecera y devuelve `HttpError` 401
  - Commit: "Agrega cliente HTTP con cookies, CSRF y errores ProblemDetail"

- [x] **B-03** Renovación de sesión, descargas y servicio de autenticación
  - Depende de: B-02
  - Cubre: RF-02-04, RF-02-05, RNF-02-02
  - Archivos: `src/lib/http.ts` (`refreshOnce`, `setAuthHandlers`, reintento CSRF, `download`), `src/schemas/user.ts`, `src/services/authService.ts`
  - Hecho cuando: tres 401 simultáneos producen un solo `/api/auth/refresh` y un reintento cada una; si el refresh falla se llama `onSessionExpired`; un 403 "Token CSRF inválido" se reintenta una vez; `download` devuelve blob y nombre; `lib/` no importa stores
  - Verificación: `npm run build && npm run lint`; prueba manual en C-04 (con login real)
  - Nota: sin sesión ya se verificó en el navegador que tres 401 simultáneos generan un solo `/refresh` y un solo `onSessionExpired`, y el reintento CSRF (403 → `GET /api/auth/csrf` → reintento con cabecera). El refresh exitoso y `download` con sesión quedan para C-04 y D-08
  - Commit: "Agrega renovación de sesión con refresh único, descargas y servicio de autenticación"

- [x] **B-04** Dirección visual aprobada y tokens de diseño
  - Depende de: B-01
  - Cubre: RF-02-06, RNF-02-03
  - Archivos: `specs/02-base-frontend/design.md` (nuevo), `src/index.css` (`@theme`), `src/main.tsx` (fuente), `package.json` (`@fontsource/…`), `index.html` y componentes de la plantilla (`Layout`, `Header`, `Navbar`, `Footer`, `HomePage`, `NotFoundPage`: colores `slate` → tokens y nombre «Cartera»)
  - Nota: el usuario pidió cambiar la paleta de la v1 (lapislázuli) y aprobó la v2 (grafito + acento ámbar); el badge de rol se muestra como «Administrador» / «Usuario»
  - Hecho cuando: el plan visual hecho con `frontend-design` está en `design.md` y **el usuario lo aprobó** (la tarea se detiene a pedir aprobación antes de escribir estilos); los tokens están en `@theme` y la fuente se sirve localmente
  - Verificación: `npm run build && npm run lint`; `HomePage` usa los tokens nuevos en el navegador
  - Commit: "Agrega la dirección visual y los tokens de diseño"

- [x] **B-05** Layout del dashboard y componentes base
  - Depende de: B-04
  - Cubre: RF-02-07, RF-02-11, RNF-02-01
  - Archivos: `src/components/layout/{AppLayout,AuthLayout,Header,Navbar,Footer}.tsx`, `src/components/ui/{Button,Input,Select,FormField,Badge,Spinner,EmptyState,PageHeader}.tsx`, `src/pages/DevUiPage.tsx` (ruta `/dev/ui` solo en desarrollo), `src/App.tsx`, `src/pages/HomePage.tsx` (usa `PageHeader`); se elimina `Layout.tsx` de la plantilla
  - Nota: `FormField` recibe el campo como función (`{(field) => <Input {...field} />}`) para pasarle `id`, `aria-describedby` y `aria-invalid` sin `cloneElement`. La región de mensajes flash se agrega al `AppLayout` en B-06
  - Hecho cuando: el layout tiene `header`, región flash, `main` ancho y `footer`; `NAV_ITEMS` acepta `roles`; los componentes base se ven en `/dev/ui`; sin scroll horizontal a 375 px
  - Verificación: `npm run build && npm run lint`; revisar `/dev/ui` en escritorio y a 375 px, foco visible con Tab
  - Commit: "Agrega el layout del dashboard y los componentes base de UI"

- [x] **B-06** Mensajes flash
  - Depende de: B-05
  - Cubre: RF-02-08, RNF-02-01
  - Archivos: `src/stores/flashStore.ts`, `src/components/ui/FlashMessages.tsx`, `src/components/ui/FlashMessage.tsx`, `src/components/layout/AppLayout.tsx`, `src/pages/DevUiPage.tsx` (botones de prueba), `src/index.css` (animación `flash-in`)
  - Nota: la región es `sticky` con altura 0 (debajo del header y visible al hacer scroll, sin empujar el contenido); la pausa conserva el tiempo restante. Un mensaje que aparece bajo un puntero quieto no se pausa hasta que el puntero se mueve (el navegador no dispara `mouseenter` sin movimiento)
  - Hecho cuando: el mensaje aparece arriba, se cierra solo a los ~5 s y con la X; se pausa con hover o foco; máximo 3; `role="status"` / `"alert"`; animación desactivada con `prefers-reduced-motion`
  - Verificación: `npm run build && npm run lint`; en `/dev/ui` medir el cierre automático, cerrar con X y con teclado, probar 4 mensajes seguidos
  - Commit: "Agrega mensajes flash con cierre automático y manual"

- [x] **B-07** Modal de confirmación
  - Depende de: B-05
  - Cubre: RF-02-09, RNF-02-01
  - Archivos: `src/components/ui/ConfirmDialog.tsx`, `src/pages/DevUiPage.tsx` (ejemplo con acción simulada que falla y que funciona), `src/components/ui/Button.tsx` (props `ComponentProps<'button'>` para aceptar `ref`)
  - Nota: Esc se intercepta (`preventDefault` en el evento `cancel`) para que el estado del padre sea la única fuente de verdad, y no cierra mientras `isPending`. Un doble clic real ejecuta la acción una vez; dos `.click()` programáticos en la misma tarea de JavaScript pueden ejecutarla dos veces porque React aún no re-renderizó el botón deshabilitado (no ocurre con interacción real)
  - Hecho cuando: `<dialog>` con `showModal()`; Esc y Cancelar cierran sin ejecutar; foco inicial en Cancelar y atrapado; `isPending` bloquea doble clic; `error` se muestra dentro sin cerrar
  - Verificación: `npm run build && npm run lint`; en `/dev/ui` probar teclado (Tab, Shift+Tab, Esc) y los dos casos simulados
  - Commit: "Agrega el modal de confirmación accesible"

- [ ] **B-08** Sidebar de filtros colapsable
  - Depende de: B-05
  - Cubre: RF-02-10, RNF-02-01
  - Archivos: `src/stores/uiStore.ts`, `src/components/filters/FiltersSidebar.tsx`, `src/components/filters/FiltersLayout.tsx`, `src/pages/DevUiPage.tsx`
  - Hecho cuando: el `aside` izquierdo se colapsa y expande con `aria-expanded`; el estado persiste al recargar; en móvil se abre como drawer
  - Verificación: `npm run build && npm run lint`; en `/dev/ui` colapsar, recargar, y probar a 375 px
  - Commit: "Agrega el sidebar de filtros colapsable con estado persistente"

- [ ] **B-09** Documentar la fase B
  - Depende de: B-03, B-06, B-07, B-08
  - Cubre: RF-02-12
  - Archivos: `README.md`, `CLAUDE.md`, `specs/02-base-frontend/spec.md` (estado: Hecha), `specs/README.md` (estado)
  - Hecho cuando: el README describe la estructura real y los componentes compartidos; `CLAUDE.md` explica `setAuthHandlers`, `refreshOnce`, `flashStore`, `ConfirmDialog` y `FiltersSidebar`
  - Verificación: `npm run build && npm run lint`
  - Commit: "Documenta la base del frontend y los componentes compartidos"
  - Al cerrar: preguntar al usuario si hace merge a `main` y push
