# Spec 03 — Autenticación y rutas por rol

| | |
|---|---|
| Fase | C |
| Repo | `4-react` |
| Estado | Pendiente |
| Depende de | Spec 02 (B-03, B-05, B-06) |
| La necesitan | Specs 04, 05 y 06 |
| Constitución | [`../constitution.md`](../constitution.md) |

## Resumen

Inicio y cierre de sesión contra `/api/auth`, restauración de la sesión al abrir la
aplicación, renovación transparente del token y rutas protegidas según el rol
(`USER`: solo lectura de clientes; `ADMIN`: todo).

## Historias de usuario

- **HU-03-1** Como usuario quiero iniciar sesión con mi email y contraseña, para acceder al dashboard.
- **HU-03-2** Como usuario quiero que, si recargo la página o vuelvo más tarde, siga dentro mientras mi sesión sea válida.
- **HU-03-3** Como usuario quiero cerrar sesión desde el header, para dejar el equipo seguro.
- **HU-03-4** Como USER quiero ver solo las secciones que puedo usar, para no encontrarme con errores de permisos.
- **HU-03-5** Como usuario quiero que, si mi sesión expira de verdad, la aplicación me lleve al login explicándome por qué y luego me devuelva a donde estaba.

## Criterios de aceptación

**CA-03-1 Login**
- Cuando envío el formulario vacío o con un email inválido, entonces veo los errores bajo cada campo sin llamar a la API.
- Cuando envío credenciales incorrectas, entonces veo "Email o contraseña incorrectos" sobre el formulario.
- Cuando las credenciales son correctas, entonces entro a la ruta que intentaba abrir (o al inicio) y el header muestra mi email y mi rol.

**CA-03-2 Sesión restaurada**
- Dado que tengo una sesión válida, cuando recargo la página, entonces sigo autenticado sin pasar por el login (mientras se comprueba, veo un indicador de carga, no el login).
- El frontend no guarda tokens en `localStorage`, `sessionStorage` ni en memoria accesible.

**CA-03-3 Renovación transparente**
- Dado que mi `access_token` venció pero el `refresh_token` sigue válido, cuando navego o guardo un formulario, entonces la petición se completa sin que yo note nada (un solo `/api/auth/refresh` y reintento).
- Dado que el refresh también falla, entonces voy al login con el mensaje flash "Tu sesión expiró, inicia sesión de nuevo" y, al volver a entrar, regreso a la ruta donde estaba.

**CA-03-4 Logout**
- Cuando cierro sesión, entonces se llama a `POST /api/auth/logout`, se limpia el cache de datos, voy al login y veo el mensaje flash "Sesión cerrada".

**CA-03-5 Rutas por rol**
- Dado que soy anónimo, cuando abro cualquier ruta interna, entonces voy al login.
- Dado que soy USER, cuando abro una ruta de ADMIN (p. ej. `/users`), entonces veo la página "Sin permiso" con un enlace al inicio, y la navegación no muestra "Usuarios".
- Cuando abro una ruta que no existe, entonces veo la página 404.

## Requisitos funcionales

| ID | Requisito |
|---|---|
| RF-03-01 | Formulario de login con React Hook Form + Zod (`email` válido, `password` obligatoria) y error general para el 401. |
| RF-03-02 | Restauración de la sesión al cargar (`GET /api/auth/me`, con refresh si hace falta) y estado `checking` / `authenticated` / `anonymous`, sin tokens en JavaScript. |
| RF-03-03 | Logout: llama a la API, limpia store y cache de TanStack Query, redirige al login y muestra un flash. |
| RF-03-04 | Rutas protegidas: un anónimo va al login conservando la ruta de origen. |
| RF-03-05 | Rutas y navegación por rol: las rutas ADMIN redirigen a `/forbidden` a un USER y la navegación oculta lo no permitido. |
| RF-03-06 | Sesión expirada: si el refresh falla, se limpia la sesión, se va al login con flash y se vuelve a la ruta original tras entrar. Si el refresh trae un rol distinto, la UI se actualiza. |
| RF-03-07 | El header muestra email y rol del usuario y un menú con "Cerrar sesión". |
| RF-03-08 | Páginas "Sin permiso" (`/forbidden`) y "No encontrada" (404). |
| RF-03-09 | `README.md` y `CLAUDE.md` documentan el flujo de sesión. |

## Requisitos no funcionales

| ID | Requisito |
|---|---|
| RNF-03-01 | La comprobación inicial de sesión se ejecuta una vez al cargar la aplicación (a nivel de módulo), no en un `useEffect`. |
| RNF-03-02 | El login es accesible: `label` en cada campo, errores asociados (`aria-describedby`), envío con Enter. |

## Fuera de alcance

- Registro de usuarios y recuperación de contraseña (no existen en el backend).
- "Recordarme": la duración la decide el backend (refresh de 7 días).
