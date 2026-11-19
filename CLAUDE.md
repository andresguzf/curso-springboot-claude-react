# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Frontend React + TypeScript del curso. Es parte de un curso: el código se muestra en pantalla y se publica en GitHub.

Todavía no hay `package.json`: el proyecto se genera con la skill `react-rules` (ver abajo).

## Recursos: documentación del backend

El frontend consume la API REST de Spring Boot del proyecto hermano `../3-spring-api`. Toda su documentación está en estos dos archivos; **léelos antes de** crear esquemas Zod, servicios o hooks de datos, de implementar login/sesión o de manejar errores de la API. No inventes endpoints, campos ni reglas: si algo no está documentado ahí, revisa el código del backend o pregunta.

| Recurso | Qué contiene |
|---|---|
| [`../3-spring-api/README.md`](../3-spring-api/README.md) | Stack y puesta en marcha (PostgreSQL con Docker, variables de entorno), seguridad y roles (`USER` / `ADMIN`), autenticación en `/api/auth` (cookies `access_token`, `refresh_token` y `XSRF-TOKEN`, ejemplos con curl), endpoints de `/api/customers` y `/api/users` con ejemplos de request/response, formatos de exportación (content negotiation), formato de errores (`ProblemDetail`) y estructura del proyecto. |
| [`../3-spring-api/CLAUDE.md`](../3-spring-api/CLAUDE.md) | Guía técnica del backend: comandos para levantarlo (`./mvnw -DskipTests spring-boot:run`), configuración (`.env`), arquitectura en capas y DTOs, reglas de acceso de `SecurityConfig`, detalles de JWT en cookies `HttpOnly`, CSRF, rotación del refresh token y el buscador `GET /api/customers?search=&active=`. |

Puntos que afectan directamente al frontend (detalle en esos archivos):

- La API corre en `http://localhost:8080`; en desarrollo usa el proxy de Vite para `/api` (mismo origen, cookies `SameSite=Strict` sin CORS).
- La sesión va en cookies `HttpOnly`: JavaScript no lee ni guarda tokens. Las peticiones llevan `credentials: 'include'` y las escrituras la cabecera `X-XSRF-TOKEN` con el valor de la cookie `XSRF-TOKEN`.
- Los errores llegan como `ProblemDetail` (`title`, `detail`, `status`); la validación agrega `errors` (campo → mensaje), útil para `setError` en React Hook Form.
- Si el backend cambia (endpoints, campos de un DTO, reglas de seguridad), actualiza los esquemas Zod y servicios del frontend en el mismo cambio.

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

Cómo se combinan las dos skills:

- En una UI nueva se usan **ambas**: `react-rules` manda en la estructura, el stack, el layout semántico y las reglas de React; `frontend-design` manda en la dirección visual (paleta, tipografía, composición, copy).
- Los tokens del plan de diseño se implementan con Tailwind CSS 4: colores y fuentes en un bloque `@theme` de `src/index.css` y se usan como clases (`bg-primary`, `font-display`), no con CSS suelto por componente. La paleta `slate` de la plantilla base es solo un punto de partida neutro.
- Cambios que no son visuales (hooks, estado, formularios, llamadas a la API, `useEffect`) usan solo `react-rules`.
- Calidad mínima en cualquier diseño: responsive hasta móvil, foco visible con teclado, `prefers-reduced-motion` respetado y contraste accesible.
