# Constitución del frontend (`4-react`)

Reglas que no se negocian en ninguna especificación ni tarea del frontend. Las specs
y tareas las **citan**; no las repiten. Si una tarea necesita romper una regla, se
cambia primero esta constitución (con su motivo) y se dice explícitamente.

Fuentes: [`CLAUDE.md`](../CLAUDE.md), skill [`react-rules`](../.claude/skills/react-rules/SKILL.md)
(con `references/patterns.md` y `references/rules-of-react.md`) y skill
[`frontend-design`](../.claude/skills/frontend-design/SKILL.md). Contrato del backend:
`../3-spring-api/README.md`, `../3-spring-api/CLAUDE.md` y la spec
`../3-spring-api/specs/01-paginacion-filtros-admin/`.

## 1. Stack

- React 19.3.1 o superior, TypeScript (strict), Vite, Tailwind CSS 4, React Router.
- TanStack Query para datos de la API, Zustand para estado global de cliente, Zod para validar, React Hook Form + `@hookform/resolvers` para formularios, `lucide-react` para iconos (spec 07), oxlint.
- Todas las dependencias en su última versión al instalarlas (`paquete@latest`).
- Node 22.22 o superior (lo pide React Router 8).
- El proyecto se genera con `bash .claude/skills/react-rules/scripts/create_project.sh .` (nunca un `package.json` a mano).

## 2. Arquitectura

- Estructura de `src/`: `pages/`, `components/{layout,ui,<recurso>}/`, `hooks/`, `stores/`, `schemas/`, `services/`, `lib/`.
- Dónde vive cada dato:
  - datos de la API → TanStack Query (`useQuery` / `useMutation` en `hooks/`); nunca `useEffect` + `fetch`, nunca copiados a Zustand;
  - estado de cliente compartido (sesión, mensajes flash, preferencias de UI) → Zustand con selectores;
  - formularios → React Hook Form + esquema Zod;
  - filtros, orden y página → la URL (`useSearchParams`), para que los enlaces se puedan compartir;
  - lo calculable desde props o estado → se calcula en el render (`useMemo` solo si es costoso).
- Reglas de React: componentes y hooks puros, hooks solo en el nivel superior, estado y props inmutables (siempre copias), lógica de usuario en event handlers, `useEffect` solo para sincronizar con sistemas externos (DOM, timers, APIs del navegador) con limpieza y dependencias completas, `key` para reiniciar estado, callbacks por props para avisar al padre.
- Tipos: sin `any`; los tipos de datos salen de esquemas Zod con `z.infer`. Cada respuesta de la API se valida con su esquema en `lib/http.ts`.
- Componentes pequeños y con una sola responsabilidad: las páginas orquestan hooks y componentes; los componentes de `components/` reciben props y emiten callbacks.

## 3. Integración con el backend

- La API corre en `http://localhost:8080`; en desarrollo se accede por el proxy de Vite (`/api`), mismo origen, sin CORS.
- En la nube (spec 09) se mantiene el mismo origen: Vercel reenvía `/api/*` al backend en Render con el rewrite de `vercel.json`. `VITE_API_URL` queda vacía; nunca se llama a la API en otro dominio.
- La sesión vive en cookies `HttpOnly`: el frontend **nunca** lee, guarda ni envía tokens a mano. Todas las peticiones usan `credentials: 'include'`.
- Escrituras (`POST`, `PUT`, `DELETE`, salvo el login) con cabecera `X-XSRF-TOKEN` = valor de la cookie `XSRF-TOKEN`.
- Un 401 dispara **un único** `POST /api/auth/refresh` compartido entre peticiones (el backend rota el refresh token y detecta reusos) y un reintento.
- Errores en formato `ProblemDetail`: `errors` (campo → mensaje) se muestran en el campo del formulario; un 409 se muestra en el modal o en un mensaje flash.
- Las reglas de negocio las impone el backend; la UI las **anticipa** (deshabilita acciones y explica por qué), nunca las reemplaza.

## 4. Interfaz

- Tailwind CSS para todos los estilos; tokens de diseño (colores, fuentes, radios) en un bloque `@theme` de `src/index.css`. Dirección visual definida con la skill `frontend-design` y aprobada por el usuario antes de codificarla.
- HTML semántico: `header`, `nav`, `main`, `aside`, `footer`, `section`, un `h1` por página, `button` para acciones y `Link` para navegar, `label` en cada campo.
- Sin `alert()` ni `confirm()`: confirmaciones con un modal propio accesible.
- Calidad mínima: responsive hasta 375 px, foco visible, navegable con teclado, `prefers-reduced-motion` respetado, contraste accesible.
- Textos de la interfaz en español, en voz activa y con el mismo verbo en botón y mensaje ("Eliminar" → "Cliente eliminado").

## 5. Privacidad

El código, los commits y la documentación son públicos (curso y GitHub). Nunca se
incluyen correos reales, contraseñas, tokens, secretos ni datos personales. Valores
locales en `.env.local` (ignorado por git); plantilla en `.env.example`.

## 6. Calidad (definición de "hecho")

Una tarea solo se marca como hecha cuando:

1. `npm run build` (tipos + build) y `npm run lint` pasan sin errores.
2. Se cumplen los criterios de "Hecho cuando" y "Verificación" de la tarea; si piden prueba en navegador, se hace con el backend levantado (`./mvnw -DskipTests spring-boot:run` en `3-spring-api`, con `JWT_COOKIE_SECURE=false` en su `.env` local).
3. Si cambia lo que el usuario ve o el contrato usado, `README.md` y `CLAUDE.md` quedan actualizados en la última tarea de la fase.

## 7. Git

- Rama de trabajo: `feature/dashboard` (la crea la tarea B-01).
- Un commit por tarea, mensaje en español e imperativo, con el trailer `Co-Authored-By` que indique la sesión.
- Sin push ni merge a `main` sin el OK explícito del usuario al cerrar cada fase.
