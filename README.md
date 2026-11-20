# Frontend React de clientes

Aplicación web en **React + TypeScript** que consume la [API REST de clientes con Spring Boot](https://github.com/andresguzf/curso-springboot-claude-api): inicio de sesión con JWT en cookies `HttpOnly`, listado y búsqueda de clientes y administración según el rol del usuario.

Proyecto del curso de Spring Boot con Claude Code.

> **Estado:** el proyecto ya está generado (React 19.3.1, Vite 8, Tailwind 4) y tiene el proxy hacia la API configurado. Las pantallas se construyen por fases según las [especificaciones](specs/README.md): las secciones "Funcionalidades previstas" y "Conexión con el backend" describen el resultado esperado al terminar todas las fases.

## Stack

| Pieza | Librería | Uso |
|---|---|---|
| UI | React 19.3.1 o superior | Componentes y hooks |
| Lenguaje | TypeScript 7 (modo `strict`) | Tipado de todo el código (`.ts` / `.tsx`) |
| Build | Vite 8 + `@vitejs/plugin-react` | Servidor de desarrollo y build de producción |
| Estilos | Tailwind CSS 4 (`@tailwindcss/vite`) | Estilos con clases utilitarias, sin CSS por componente |
| Rutas | React Router 8 | Páginas y layout compartido |
| Datos de la API | TanStack Query 5 (+ devtools) | Cache compartido, refetch automático y estados de carga |
| Estado global | Zustand 5 | Estado del cliente compartido (p. ej. usuario en sesión) |
| Validación | Zod 4 | Esquemas que validan respuestas y formularios y generan los tipos |
| Formularios | React Hook Form + `@hookform/resolvers` | Formularios validados con los esquemas Zod |
| Lint | oxlint | Reglas de hooks (`rules-of-hooks`, `exhaustive-deps`) |

Todas las dependencias se instalan en su última versión publicada al generar el proyecto.

## Requisitos

- Node.js 22.22 o superior (lo pide React Router 8); se recomienda la LTS más reciente
- El [backend de Spring Boot](https://github.com/andresguzf/curso-springboot-claude-api) corriendo en `http://localhost:8080` (con PostgreSQL), para usar la app con datos reales

## Cómo se generó el proyecto

El proyecto se creó con el script de la skill `react-rules`, que parte de la plantilla oficial de Vite (`react-ts`), agrega la estructura y el layout base, instala las dependencias en su última versión y verifica que compile. No sobrescribe archivos existentes como este README o `CLAUDE.md`, y se niega a correr si ya hay un `package.json` (no hace falta volver a ejecutarlo):

```bash
bash .claude/skills/react-rules/scripts/create_project.sh .
```

## Puesta en marcha

1. Clona el repositorio:

   ```bash
   git clone https://github.com/andresguzf/curso-springboot-claude-react.git
   cd curso-springboot-claude-react
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea tu archivo de variables de entorno a partir de la plantilla (`.env.local` está en `.gitignore`):

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Descripción | Valor por defecto |
   |---|---|---|
   | `VITE_API_URL` | URL base de la API. Vacía = mismo origen (con el proxy de Vite) | vacía |

4. Levanta el backend (ver su README) y luego el frontend:

   ```bash
   npm run dev
   ```

   La app queda en http://localhost:5173.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Revisa los tipos (`tsc -b`) y genera el build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción para probarlo localmente |
| `npm run lint` | Corre oxlint (reglas de hooks y dependencias de effects) |

## Conexión con el backend

La API protege la sesión con **JWT en cookies `HttpOnly`** y **CSRF**, así que el frontend nunca lee ni guarda tokens. Para que funcione:

- **Proxy de Vite en desarrollo**: las peticiones a `/api` se reenvían a `http://localhost:8080`. Así frontend y API comparten origen, las cookies `SameSite=Strict` viajan solas y no hace falta configurar CORS. Se configura en `vite.config.ts`:

  ```ts
  server: { proxy: { '/api': 'http://localhost:8080' } }
  ```

- **Cookies**: todas las peticiones salen con `credentials: 'include'` desde `src/lib/http.ts`.
- **CSRF**: los `POST`, `PUT` y `DELETE` (salvo el login) llevan la cabecera `X-XSRF-TOKEN` con el valor de la cookie `XSRF-TOKEN`; si la cookie no existe, primero se pide `GET /api/auth/csrf`. Un 403 "Token CSRF inválido" renueva el token y reintenta una vez.
- **Sesión expirada**: el `access_token` dura 15 minutos; ante un 401 se hace **un solo** `POST /api/auth/refresh` compartido entre todas las peticiones (el backend rota el refresh token y detecta reusos) y cada petición se reintenta una vez. Si el refresh falla, la app vuelve al login (ver «Flujo de sesión»).
- **Descargas**: las exportaciones usan `http.download()`, que pasa por la misma renovación de sesión.
- **Errores**: la API responde en formato `ProblemDetail` (`title`, `detail`, `status`). Los errores de validación traen `errors` (campo → mensaje), que se muestran junto a cada campo del formulario.

Endpoints usados (detalle completo, roles y ejemplos en el README del backend):

| Recurso | Endpoints |
|---|---|
| Autenticación | `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`, `GET /api/auth/csrf` |
| Clientes | `GET /api/customers` (paginado, con filtros y orden; `?format=` para exportar), `GET`/`PUT`/`DELETE /api/customers/{id}`, `POST /api/customers` |
| Usuarios (solo `ADMIN`) | `GET /api/users` (paginado, con filtros), `GET`/`PUT`/`DELETE /api/users/{id}`, `POST /api/users` |

### Flujo de sesión

El frontend solo conoce **quién** está en sesión (`authStore`: `user` y `status`); los tokens los maneja el navegador en las cookies.

| Momento | Qué pasa |
|---|---|
| Al cargar la app | `main.tsx` llama una vez a `initSession()` (antes del render, sin `useEffect`): `GET /api/auth/me`. Mientras responde, `status` es `checking` y las rutas protegidas muestran un spinner, no el login. Si el access token venció, `http.ts` renueva la sesión y reintenta `/me` sin que se note. |
| Login | `POST /api/auth/login`; el backend pone las cookies y devuelve el usuario. Se vacía la caché de datos y se entra a la ruta que se intentaba abrir (o al inicio). Credenciales incorrectas: «Email o contraseña incorrectos». |
| Rutas | `RequireAuth` envía al login a quien no tiene sesión, guardando la ruta de origen en `location.state` (no en la URL). `RequireRole role="ADMIN"` envía a `/forbidden` a un `USER`; la navegación oculta lo que su rol no puede usar. |
| Access token vencido (15 min) | La primera petición recibe 401 y hace **un solo** `POST /api/auth/refresh`; las que lleguen mientras tanto esperan esa misma promesa y todas se reintentan. El refresh trae el usuario: si su rol cambió, la interfaz se actualiza. |
| Refresh vencido o revocado (7 días, logout en otro equipo, cambio de contraseña) | Se limpia la sesión y la caché, se va al login con el flash «Tu sesión expiró, inicia sesión de nuevo» y, al entrar, se vuelve a la ruta donde estaba. Al abrir la app sin sesión no se muestra ese aviso: nunca hubo sesión. |
| Cerrar sesión | `POST /api/auth/logout` (el backend revoca el refresh token y borra las cookies); se limpia la sesión aunque la API falle, se va al login con el flash «Sesión cerrada» y el siguiente login empieza en el inicio. |

**Cómo probar la renovación sin esperar 15 minutos**: las cookies son `HttpOnly` (DevTools > Application > Cookies permite borrarlas a mano) o, más fiel, levanta el backend con tokens cortos; el `Max-Age` de las cookies sigue esos tiempos, así que el navegador las borra solo al vencer:

```bash
./mvnw -DskipTests spring-boot:run -Dspring-boot.run.arguments="--app.jwt.access-token-expiration=20s --app.jwt.refresh-token-expiration=90s"
```

Con la pestaña Network abierta: pasados 20 s, recargar muestra `/me` 401 → un solo `/refresh` 200 → `/me` 200. Pasados 90 s sin actividad, la siguiente petición lleva al login con el aviso y, al entrar, de vuelta a la ruta original.

## Funcionalidades previstas

Según lo que ofrece la API:

- **Login y logout**, con el usuario en sesión y su rol en el header; rutas protegidas por sesión y por rol (hecho, spec 03).
- **Clientes** (roles `USER` y `ADMIN`): listado con buscador por texto y filtro por estado activo/inactivo.
- **Crear, editar y eliminar clientes** (solo `ADMIN`): formulario validado y errores del servidor (p. ej. email duplicado, 409) mostrados en el campo correspondiente. Las acciones de escritura se ocultan para el rol `USER`.
- **Administración de usuarios** (solo `ADMIN`).
- Páginas «Sin permiso» (`/forbidden`), 404 para rutas inexistentes y «Algo salió mal» para errores inesperados (hecho, spec 03).

## Estructura

```
src/
├── main.tsx              # fuente, handlers de sesión, initSession(), StrictMode, QueryClientProvider
├── App.tsx               # router: /login (AuthLayout) y el resto en RequireAuth + AppLayout (+ /dev/ui en desarrollo)
├── index.css             # Tailwind + tokens de diseño (@theme) y foco ámbar global
├── components/
│   ├── auth/             # LoginForm, RequireAuth (sesión) y RequireRole (rol)
│   ├── layout/           # AppLayout, AuthLayout, Header, Navbar (enlaces por rol), UserMenu, Footer
│   ├── ui/               # Button, Input, Select, FormField, Badge, Spinner, EmptyState, PageHeader,
│   │                     # FlashMessages / FlashMessage y ConfirmDialog
│   ├── filters/          # FiltersLayout, FiltersSidebar (escritorio) y FiltersDrawer (móvil)
│   └── {recurso}/        # componentes de un recurso (clientes, usuarios) — specs 04 y 05
├── pages/                # una página por ruta (Home, Login, Forbidden, NotFound, RouteError, DevUi)
├── hooks/                # useAuth / useLogin / useLogout, useMediaQuery, useModalDialog
├── stores/               # authStore (sesión, sin tokens), flashStore (mensajes) y uiStore (sidebar, persistido)
├── schemas/              # Zod: common (página, ProblemDetail), user (+ ROLE_LABELS) y auth (login)
├── services/             # authService (login, refresh, logout, me, csrf)
└── lib/                  # http.ts (cliente HTTP), session.ts (initSession), query.ts (toQuery), queryClient.ts
```

El layout usa HTML semántico: `header` (banda grafito con la marca y la navegación `nav`), región de mensajes flash, `main` y `footer`.

## Interfaz

La dirección visual está en [`specs/02-base-frontend/design.md`](specs/02-base-frontend/design.md): grafito con un solo acento ámbar, fondo gris frío y la fuente **Atkinson Hyperlegible Next** (autoalojada, con cifras tabulares). Los tokens se usan como clases de Tailwind (`bg-canvas`, `text-ink`, `bg-primary`, `bg-accent-soft`, `rounded-panel`…).

Piezas compartidas que usan todas las pantallas:

| Pieza | Qué hace |
|---|---|
| Mensajes flash | Arriba de la app, se cierran solos a los 5 s (se pausan con el puntero o el foco) y con la X; máximo 3. Se publican con `flash.success(…)`, `flash.error(…)` o `flash.info(…)` |
| `ConfirmDialog` | Modal de confirmación con `<dialog>` nativo: foco inicial en Cancelar, Esc cancela, bloquea el doble envío y muestra el error dentro. Reemplaza a `confirm()` |
| `FiltersLayout` | Filtros en un sidebar izquierdo colapsable (recuerda su estado al recargar) o, en pantallas chicas, en un cajón lateral |

Con `npm run dev`, la página **`/dev/ui`** muestra el catálogo de componentes para revisarlos (no existe en el build de producción).

## Convenciones

- **Dónde vive cada dato**: los datos de la API en TanStack Query; el estado de cliente compartido (sesión) en Zustand; el estado de un formulario en React Hook Form; lo calculable a partir de props o estado se calcula en el render.
- **Tipos desde Zod**: cada respuesta de la API se valida con su esquema y los tipos se obtienen con `z.infer`, sin `any`.
- **`useEffect` solo para sistemas externos** (DOM, timers, APIs del navegador). Nunca para traer datos, derivar estado ni reaccionar a acciones del usuario: eso va en los event handlers.
- **Estado inmutable**: siempre copias (`[...arr, x]`, `map`, `filter`, `{ ...obj }`), nunca mutaciones.
- **Componentes pequeños** y con una sola responsabilidad; los hijos avisan al padre con callbacks por props.
- Antes de subir un cambio, `npm run build` y `npm run lint` deben pasar sin errores.

Las reglas completas están en la skill [`react-rules`](.claude/skills/react-rules/SKILL.md).

## Desarrollo guiado por especificaciones (SDD)

El dashboard se construye por fases a partir de especificaciones: cada fase tiene su `spec.md` (qué y por qué), `plan.md` (cómo) y `tasks.md` (tareas en orden). El índice, el estado de cada fase y la cobertura de los requisitos están en [`specs/README.md`](specs/README.md). La fase 01 modifica el backend y sus specs viven en el repositorio de la API (`specs/01-paginacion-filtros-admin/`).

## Desarrollo con Claude Code

El proyecto incluye skills de Claude Code registradas en [`CLAUDE.md`](CLAUDE.md):

| Skill | Para qué |
|---|---|
| `react-rules` | Genera el proyecto y aplica la estructura, el stack y las Reglas de React al escribir código |
| `frontend-design` | Dirección visual de la interfaz: paleta, tipografía, layout y textos |
| `sdd-next-task` | Ejecuta las tareas del SDD de una en una: implementa, verifica, hace commit y se detiene para revisión |

La documentación del backend que usa Claude como referencia está en el [`README.md`](https://github.com/andresguzf/curso-springboot-claude-api/blob/main/README.md) y el [`CLAUDE.md`](https://github.com/andresguzf/curso-springboot-claude-api/blob/main/CLAUDE.md) del backend (en local, en la carpeta hermana `../3-spring-api`).
