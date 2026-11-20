# Tareas — Spec 03 (Fase C)

Se ejecutan **una a una** con la skill `sdd-next-task`. Definición de "hecho" en la
[constitución](../constitution.md#6-calidad-definición-de-hecho). Las pruebas en
navegador necesitan el backend arriba.

- [x] **C-01** Store de sesión e inicialización al cargar
  - Depende de: B-03, B-06
  - Cubre: RF-03-02, RF-03-06, RNF-03-01
  - Archivos: `src/stores/authStore.ts`, `src/lib/session.ts`, `src/main.tsx`
  - Hecho cuando: `initSession()` corre una vez a nivel de módulo; `setAuthHandlers` conecta `onRefreshed` (actualiza el usuario) y `onSessionExpired` (limpia store y cache, flash); no hay tokens en JavaScript
  - Verificación: `npm run build && npm run lint`; sin sesión, `status` termina en `anonymous` (React DevTools o log temporal que se quita antes del commit)
  - Commit: "Agrega el estado de sesión y su inicialización al cargar la aplicación"

- [ ] **C-02** Pantalla de login
  - Depende de: C-01, B-05
  - Cubre: RF-03-01, RNF-03-02
  - Archivos: `src/schemas/auth.ts`, `src/hooks/useAuth.ts` (`useAuth`, `useLogin`), `src/components/auth/LoginForm.tsx`, `src/pages/LoginPage.tsx`, `src/App.tsx` (ruta `/login` con `AuthLayout`)
  - Hecho cuando: validación en cliente con mensajes en español; 401 muestra "Email o contraseña incorrectos"; login correcto entra y el header muestra email y rol
  - Verificación: `npm run build && npm run lint`; en el navegador, login con el admin del `.env` del backend (credenciales locales, nunca en el código)
  - Commit: "Agrega la pantalla de inicio de sesión"

- [ ] **C-03** Rutas protegidas, menú de usuario y logout
  - Depende de: C-02
  - Cubre: RF-03-03, RF-03-04, RF-03-05, RF-03-07, RF-03-08
  - Archivos: `src/components/auth/{RequireAuth,RequireRole}.tsx`, `src/components/layout/{UserMenu,Navbar,Header}.tsx`, `src/hooks/useAuth.ts` (`useLogout`), `src/pages/{ForbiddenPage,NotFoundPage,RouteErrorPage}.tsx`, `src/App.tsx`
  - Hecho cuando: anónimo → `/login` con retorno a la ruta original; USER no ve ni abre rutas ADMIN (`/forbidden`); logout limpia todo, va a `/login` y muestra flash; 404 para rutas desconocidas
  - Verificación: `npm run build && npm run lint`; en el navegador como ADMIN y como USER (crear un USER con el curl del README del backend)
  - Commit: "Agrega rutas protegidas por rol, menú de usuario y cierre de sesión"

- [ ] **C-04** Verificar la renovación de sesión de punta a punta y documentar la fase C
  - Depende de: C-03
  - Cubre: RF-03-06, RF-03-09
  - Archivos: `README.md` (sección "Conexión con el backend"), `CLAUDE.md`, `specs/03-autenticacion/spec.md` (estado: Hecha), `specs/README.md` (estado); correcciones en `src/lib/http.ts` si la prueba falla
  - Hecho cuando: con DevTools, borrar la cookie `access_token` y recargar produce un solo `/refresh` y el reintento 200; borrar también `refresh_token` lleva al login con flash y, tras entrar, vuelve a la ruta original; el flujo está documentado
  - Verificación: `npm run build && npm run lint`; prueba manual descrita (Network en DevTools)
  - Commit: "Documenta el flujo de sesión y verifica la renovación del token"
  - Al cerrar: preguntar al usuario si hace merge a `main` y push
