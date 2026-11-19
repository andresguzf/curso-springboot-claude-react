# Spec 06 — Pulido, accesibilidad y documentación final

| | |
|---|---|
| Fase | F |
| Repo | `4-react` (y un enlace en `3-spring-api/README.md`) |
| Estado | Pendiente |
| Depende de | Specs 04 y 05 |
| La necesitan | — |
| Constitución | [`../constitution.md`](../constitution.md) |

## Resumen

Pantalla de inicio con un resumen útil, estados de carga y vacíos cuidados, títulos
de página, foco al navegar, revisión responsive y de accesibilidad, limpieza de las
herramientas de desarrollo y documentación final de ambos repos.

## Historias de usuario

- **HU-06-1** Como usuario quiero ver al entrar un resumen de la cartera (clientes, activos, nuevos este mes y, si soy ADMIN, usuarios), para saber el estado general de un vistazo.
- **HU-06-2** Como usuario quiero que la aplicación se vea bien y se use igual en el móvil y en el escritorio.
- **HU-06-3** Como usuario de teclado o de lector de pantalla quiero poder usar todas las pantallas.
- **HU-06-4** Como desarrollador que llega al proyecto quiero documentación que refleje el código real.

## Criterios de aceptación

**CA-06-1 Resumen**
- Cuando entro a `/`, entonces veo el total de clientes, los activos y los dados de alta este mes; si soy ADMIN, también el total de usuarios. Cada cifra enlaza al listado ya filtrado.

**CA-06-2 Estados y navegación**
- Las tablas muestran un esqueleto mientras cargan por primera vez; los estados vacíos explican qué hacer.
- El título de la pestaña cambia con cada página ("Clientes · nombre de la app").
- Al navegar, el foco va al `h1` de la página nueva.

**CA-06-3 Responsive**
- A 375 px: sin scroll horizontal de la página, el sidebar de filtros es un drawer, la navegación cabe y las tablas se desplazan dentro de su contenedor.

**CA-06-4 Accesibilidad**
- La auditoría de Lighthouse (categoría accesibilidad) da 90 o más en login, clientes y usuarios; no hay problemas de contraste ni de foco.
- Con `prefers-reduced-motion` no hay animaciones de entrada.

**CA-06-5 Cierre**
- La ruta `/dev/ui` ya no existe.
- `README.md` y `CLAUDE.md` del frontend describen la estructura real, el flujo de sesión y las convenciones; el `README.md` del backend enlaza al frontend.

## Requisitos funcionales

| ID | Requisito |
|---|---|
| RF-06-01 | Página de inicio con totales (clientes, activos, nuevos del mes y usuarios si es ADMIN) enlazados a los listados filtrados. |
| RF-06-02 | Esqueletos de carga y estados vacíos con acción en todas las tablas. |
| RF-06-03 | Título del documento por página y foco en el `h1` al navegar. |
| RF-06-04 | Revisión responsive a 375 px y escritorio. |
| RF-06-05 | Auditoría de accesibilidad (≥ 90 en Lighthouse) y corrección de lo encontrado. |
| RF-06-06 | Eliminar `/dev/ui`, documentación final de ambos repos y cierre del SDD. |

## Requisitos no funcionales

| ID | Requisito |
|---|---|
| RNF-06-01 | Los totales se obtienen con consultas `size=1` (usa `totalElements`), sin traer listas completas. |

## Fuera de alcance

- Gráficos o estadísticas avanzadas (no hay endpoints de agregación).
- Internacionalización (la interfaz es solo en español).
