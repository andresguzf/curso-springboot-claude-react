# Especificaciones (SDD)

Este proyecto se construye con **desarrollo guiado por especificaciones** (SDD), en
formato estilo Spec Kit y solo con Markdown. Cada fase tiene tres documentos:

| Documento | Responde | Contenido |
|---|---|---|
| `spec.md` | Qué y por qué | Historias de usuario, criterios de aceptación (Dado / Cuando / Entonces), requisitos funcionales (`RF-NN-xx`) y no funcionales, fuera de alcance |
| `plan.md` | Cómo | Contrato de la API, decisiones con su motivo, archivos, riesgos y trazabilidad RF → tareas |
| `tasks.md` | En qué orden | Tareas pequeñas con checkbox, dependencias, requisitos que cubren, criterio de "hecho", verificación y mensaje de commit |

Las reglas comunes están en la constitución de cada repo:
[frontend](constitution.md) y [backend](../../3-spring-api/specs/constitution.md).

## Cómo se ejecuta

Con la skill `sdd-next-task` (desde una sesión de Claude Code en `4-react`):

- "siguiente tarea" / "continúa con el SDD" → toma la primera tarea pendiente cuyas dependencias estén hechas.
- "ejecuta la tarea D-03" → ejecuta esa tarea si sus dependencias están hechas.

Cada tarea se implementa, se verifica, se marca `[x]`, se hace commit en su repo y la
ejecución **se detiene** para que la revises. Al cerrar una fase se pregunta si se
hace merge a `main` y push.

## Fases

Orden recomendado: 01 → 02 → 03 → 04 → 05 → 06. La fase 02 y la 03 no dependen del
backend nuevo y pueden avanzar antes de terminar la 01; la 04 necesita A-06 y la 05
necesita A-09 y A-10.

| # | Fase | Repo | Spec | Tareas | Estado |
|---|---|---|---|---|---|
| 01 | A · Paginación, filtros y último admin | `3-spring-api` | [spec](../../3-spring-api/specs/01-paginacion-filtros-admin/spec.md) | A-01 … A-11 | En curso (4/11) |
| 02 | B · Base del frontend, diseño y componentes | `4-react` | [spec](02-base-frontend/spec.md) | B-01 … B-09 | Pendiente |
| 03 | C · Autenticación y rutas por rol | `4-react` | [spec](03-autenticacion/spec.md) | C-01 … C-04 | Pendiente |
| 04 | D · Clientes | `4-react` | [spec](04-clientes/spec.md) | D-01 … D-09 | Pendiente |
| 05 | E · Usuarios y roles | `4-react` | [spec](05-usuarios/spec.md) | E-01 … E-06 | Pendiente |
| 06 | F · Pulido, accesibilidad y documentación | `4-react` | [spec](06-pulido/spec.md) | F-01 … F-04 | Pendiente |

Estados posibles: Pendiente, En curso (`X/N` tareas), Hecha.

## Prerrequisitos

- Node 22.22 o superior (o 24 LTS) antes de B-01.
- Backend levantado con PostgreSQL para las pruebas en navegador (ver `../3-spring-api/README.md`).

## Cobertura del pedido original

| Requisito | Dónde se especifica |
|---|---|
| Mensajes flash (arriba, ~5 s, se cierran solos y con X) | Spec 02 (componente) · specs 04 y 05 (uso al crear, editar y eliminar) |
| Administración de clientes | Spec 04 |
| Administración de usuarios y cambio de rol (USER / ADMIN) | Spec 05 · spec 01 (backend) |
| Reglas de administradores (no eliminarse, último admin) | Spec 01 (backend) · spec 05 (UI) |
| Modal de confirmación en lugar de `confirm()` | Spec 02 (componente) · specs 04 y 05 (uso) |
| Paginación | Spec 01 (backend) · specs 02, 04 y 05 |
| Búsqueda por nombre, apellido y email | Spec 01 (backend) · spec 04 |
| Filtros por fecha y otros | Spec 01 (backend) · specs 04 y 05 |
| Sidebar izquierdo colapsable para filtros | Spec 02 (componente) · specs 04 y 05 (contenido) |
| UI/UX moderna con Tailwind | Spec 02 (dirección visual) · spec 06 (pulido) |
| Crear roles nuevos | Fuera de alcance por decisión del usuario: se mantiene el enum USER / ADMIN |
