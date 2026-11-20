# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Frontend React + TypeScript del curso. Es parte de un curso: el código se muestra en pantalla y se publica en GitHub.

Proyecto generado con el script de la skill `react-rules` (Vite + React 19.3.1 + TypeScript 7 + Tailwind 4); no lo vuelvas a ejecutar. `vite.config.ts` reenvía `/api` a `http://localhost:8080`. Las pantallas se construyen por fases según `specs/` (ver abajo).

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
- **`setAuthHandlers({ onRefreshed, onSessionExpired })`**: `lib/` no importa stores ni el router; la app registra en `main.tsx` qué hacer cuando la sesión se renueva o expira (se avisa una vez por renovación). Se conecta en la spec 03.
- **`flashStore`** (`src/stores/flashStore.ts`): mensajes flash globales (máx. 3, 5 s). Publícalos con `flash.success/error/info(texto)` desde handlers u `onSuccess` / `onError` de mutaciones, nunca desde un `useEffect` que observa datos. La región (`FlashMessages`) ya está en `AppLayout`.
- **`ConfirmDialog`** (`src/components/ui/`): toda eliminación o acción destructiva lo usa (nunca `confirm()`). El padre controla `open` con estado local y le pasa `isPending` y `error` de la mutación; `tone="danger"` y `confirmLabel` con el verbo ("Eliminar").
- **`FiltersLayout`** (`src/components/filters/`): `filters` (campos), `activeCount`, `onClear` y el contenido como `children`. Desde `lg` muestra `FiltersSidebar` (colapsable, estado en `uiStore` persistido); en pantallas chicas, `FiltersDrawer`.
- **Hooks**: `useModalDialog(open, initialFocusRef)` sincroniza un `<dialog>` modal (lo usan `ConfirmDialog` y el cajón); `useMediaQuery(query)` con `useSyncExternalStore`.
- **Componentes base** en `src/components/ui/`: `Button` (variantes, `isPending`, acepta `ref`), `Input`, `Select`, `FormField` (recibe el campo como función: `{(field) => <Input {...field} />}`, así asocia etiqueta, ayuda y error), `Badge` (estado y rol en minúscula de oración: «Administrador» / «Usuario»), `Spinner`, `EmptyState`, `PageHeader` (el `h1` de cada página).
- **Estilos**: solo tokens del `@theme` de `src/index.css` (dirección visual en `specs/02-base-frontend/design.md`); el ámbar (`accent`) nunca como color de texto (usa `accent-strong`). La ruta `/dev/ui` (solo `npm run dev`) es el catálogo de componentes; agrega ahí las piezas nuevas para revisarlas.

## Desarrollo guiado por especificaciones (SDD)

El dashboard (frontend) y los cambios que necesita en el backend se construyen con SDD, en formato estilo Spec Kit (solo Markdown). Índice y estado de las fases: [`specs/README.md`](specs/README.md).

- `specs/constitution.md` (frontend) y `../3-spring-api/specs/constitution.md` (backend): reglas que no se negocian.
- Cada fase tiene `spec.md` (qué y por qué: historias, criterios de aceptación, `RF-NN-xx`), `plan.md` (cómo: contrato, decisiones, archivos, trazabilidad) y `tasks.md` (tareas con checkbox, dependencias, verificación y mensaje de commit).
- Orden: 01 backend (`../3-spring-api/specs/01-paginacion-filtros-admin/`, tareas `A-xx`) → 02 base (`B-xx`) → 03 autenticación (`C-xx`) → 04 clientes (`D-xx`) → 05 usuarios (`E-xx`) → 06 pulido (`F-xx`). Las fases 02 y 03 no dependen del backend nuevo; la 04 necesita A-06 y la 05 necesita A-09 y A-10.
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
