# Spec 02 — Base del frontend, diseño y componentes compartidos

| | |
|---|---|
| Fase | B |
| Repo | `4-react` |
| Estado | En curso (7/9) |
| Depende de | — (no necesita la spec 01 del backend) |
| La necesitan | Specs 03, 04, 05 y 06 |
| Constitución | [`../constitution.md`](../constitution.md) |

## Resumen

Generar el proyecto React, conectarlo con el backend (proxy, cookies, CSRF, renovación
de sesión) y construir la base visual y los componentes que usan todas las pantallas:
layout tipo dashboard, mensajes flash, modal de confirmación y sidebar de filtros
colapsable.

## Historias de usuario

- **HU-02-1** Como desarrollador quiero el proyecto generado con el stack acordado y conectado al backend, para empezar a construir pantallas sin configurar nada más.
- **HU-02-2** Como usuario quiero una interfaz moderna, profesional y coherente en todas las pantallas, para trabajar cómodo durante horas.
- **HU-02-3** Como usuario quiero ver un mensaje claro arriba de la pantalla cuando una acción termina, que desaparezca solo y que pueda cerrar antes, para saber qué pasó sin que me estorbe.
- **HU-02-4** Como usuario quiero que las acciones destructivas me pidan confirmación en una ventana propia de la aplicación, para no borrar nada por error.
- **HU-02-5** Como usuario quiero ocultar el panel de filtros, para ver la tabla completa cuando lo necesito, y que la aplicación recuerde mi preferencia.
- **HU-02-6** Como usuario no quiero que la sesión se corte mientras trabajo mientras mi sesión siga siendo válida.

## Criterios de aceptación

**CA-02-1 Proyecto y proxy**
- Dado el proyecto generado, cuando corro `npm run build` y `npm run lint`, entonces terminan sin errores y `react` instalado es ≥ 19.3.1.
- Dado `npm run dev` y el backend arriba, cuando pido `http://localhost:5173/api/auth/csrf`, entonces recibo 200 desde el backend y la cookie `XSRF-TOKEN`.

**CA-02-2 Cliente HTTP**
- Cuando hago un `POST`, `PUT` o `DELETE` (salvo el login), entonces la petición lleva `X-XSRF-TOKEN` con el valor de la cookie; si la cookie no existe, primero se obtiene con `GET /api/auth/csrf`.
- Cuando el backend responde un error `ProblemDetail`, entonces recibo un `HttpError` con `status`, `title`, `detail` y, si hay, los errores por campo.
- Cuando una respuesta no cumple su esquema Zod, entonces la petición falla con un error de validación (no llega un objeto incompleto a la UI).

**CA-02-3 Renovación de sesión**
- Dadas tres peticiones simultáneas que responden 401, cuando se renueva la sesión, entonces se hace **un solo** `POST /api/auth/refresh` y las tres peticiones se reintentan una vez.
- Cuando el refresh falla, entonces se notifica "sesión expirada" a la aplicación y las peticiones fallan con 401.
- Cuando una escritura responde 403 por CSRF inválido, entonces se renueva el token CSRF y se reintenta una vez.

**CA-02-4 Dirección visual**
- Antes de escribir estilos, el usuario aprueba un plan visual (paleta, tipografía, layout y principios) hecho con la skill `frontend-design`.
- Los tokens aprobados están en `@theme` de `src/index.css` y los componentes los usan como clases de Tailwind.

**CA-02-5 Layout**
- Toda pantalla autenticada tiene `header` (marca, navegación y zona de usuario), región de mensajes flash arriba, `main` con el contenido y `footer`.
- A 375 px de ancho no hay scroll horizontal de la página.

**CA-02-6 Mensajes flash**
- Cuando se publica un mensaje, entonces aparece en la parte superior de la aplicación.
- Cuando pasan ~5 segundos, entonces desaparece solo.
- Cuando hago clic en la X, entonces desaparece de inmediato.
- Mientras el puntero o el foco están sobre el mensaje, el tiempo se pausa.
- Hay variantes de éxito, error e información; como máximo se muestran 3 a la vez.
- Los lectores de pantalla anuncian el mensaje (`role="status"` o `role="alert"` según el tipo).

**CA-02-7 Modal de confirmación**
- Cuando abro una confirmación, entonces aparece una ventana modal con título, descripción y botones **Confirmar** y **Cancelar**; el resto de la pantalla queda inactivo.
- Cuando presiono Esc o Cancelar, entonces se cierra sin ejecutar la acción.
- El foco empieza en Cancelar y no sale del modal con Tab.
- Mientras la acción está en curso, Confirmar muestra el estado de carga y no se puede pulsar dos veces.
- Si la acción falla, el mensaje de error se muestra dentro del modal sin cerrarlo.
- No se usa `alert()` ni `confirm()` en ninguna parte.

**CA-02-8 Sidebar de filtros**
- El panel de filtros está a la izquierda del contenido y se puede colapsar y expandir con un botón accesible (`aria-expanded`).
- Cuando recargo la página, entonces el panel conserva el estado (colapsado o expandido).
- En móvil el panel se abre como cajón (drawer) sobre el contenido.

## Requisitos funcionales

| ID | Requisito |
|---|---|
| RF-02-01 | Proyecto generado con el script de `react-rules` en la rama `feature/dashboard`, con React ≥ 19.3.1. |
| RF-02-02 | Proxy de Vite `/api` → `http://localhost:8080`; `VITE_API_URL` vacía por defecto en `.env.example`. |
| RF-02-03 | Cliente HTTP con `credentials: 'include'`, CSRF en escrituras, validación Zod de respuestas y `HttpError` construido desde `ProblemDetail`. |
| RF-02-04 | Renovación de sesión ante 401 con un único refresh compartido y un reintento; aviso de sesión expirada si falla; reintento único ante CSRF inválido. |
| RF-02-05 | Descarga de archivos (blob + nombre desde `Content-Disposition`) pasando por la misma renovación de sesión. |
| RF-02-06 | Dirección visual aprobada por el usuario e implementada como tokens en `@theme`, con fuente autoalojada. |
| RF-02-07 | Layout de dashboard reutilizable (`AppLayout` y `AuthLayout`) con HTML semántico y navegación filtrada por rol. |
| RF-02-08 | Mensajes flash globales: arriba, ~5 s, cierre automático y manual con X, pausa al pasar el puntero o el foco, máximo 3, accesibles. |
| RF-02-09 | Modal de confirmación accesible y reutilizable con Confirmar / Cancelar, estado de carga y error interno. |
| RF-02-10 | Sidebar izquierdo de filtros colapsable, con estado persistente y drawer en móvil. |
| RF-02-11 | Componentes base reutilizables: `Button`, `Input`, `Select`, `FormField`, `Badge`, `Spinner`, `EmptyState`, `PageHeader`. |
| RF-02-12 | `README.md` y `CLAUDE.md` reflejan el proyecto generado y los componentes compartidos. |

## Requisitos no funcionales

| ID | Requisito |
|---|---|
| RNF-02-01 | Accesibilidad: foco visible, teclado completo, `prefers-reduced-motion` respetado, contraste AA. |
| RNF-02-02 | `lib/` no importa stores ni el router (se comunica con la app mediante `setAuthHandlers`). |
| RNF-02-03 | Sin dependencias de CDN: fuentes e íconos se instalan como paquetes. |

## Fuera de alcance

- Pantallas de negocio (clientes, usuarios), login y rutas protegidas: specs 03 a 05.
- Tema oscuro (se puede agregar en la spec 06 si el plan visual lo propone).

## Preguntas abiertas

- ~~Paleta y tipografía~~ Resuelta en B-04: grafito + acento ámbar y Atkinson Hyperlegible Next ([`design.md`](design.md)).
