# Spec 04 — Clientes: listado, filtros, CRUD y exportación

| | |
|---|---|
| Fase | D |
| Repo | `4-react` |
| Estado | En curso |
| Depende de | Spec 03 y spec 01 del backend (A-06: listado paginado y filtros) |
| La necesitan | Spec 06 |
| Constitución | [`../constitution.md`](../constitution.md) |

## Resumen

Pantallas de clientes: tabla paginada y ordenable, búsqueda, filtros en el sidebar
izquierdo colapsable, detalle, alta, edición y eliminación con modal de confirmación,
mensajes flash y exportación del resultado filtrado.

## Historias de usuario

- **HU-04-1** Como usuario quiero ver los clientes en una tabla paginada y ordenar por columna, para recorrer la cartera con comodidad.
- **HU-04-2** Como usuario quiero buscar por nombre, apellido o email, para encontrar a un cliente concreto.
- **HU-04-3** Como usuario quiero filtrar por estado, ciudad, fecha de nacimiento y fecha de alta en un panel lateral que pueda ocultar, para analizar grupos sin perder espacio de tabla.
- **HU-04-4** Como usuario quiero compartir o guardar la URL con los filtros aplicados, para volver al mismo resultado.
- **HU-04-5** Como usuario quiero ver la ficha de un cliente, incluida su fecha de alta y de última modificación.
- **HU-04-6** Como ADMIN quiero crear, editar y eliminar clientes con validaciones claras y confirmación antes de eliminar, para mantener la cartera al día sin errores.
- **HU-04-7** Como usuario quiero exportar a CSV, Excel, PDF o XML exactamente lo que filtré, para trabajarlo fuera del sistema.

## Criterios de aceptación

**CA-04-1 Tabla paginada**
- Cuando abro `/customers`, entonces veo 10 clientes por página con nombre completo, email, teléfono, ciudad, fecha de nacimiento, estado y fecha de alta, y el texto "Mostrando 1–10 de N".
- Cuando cambio a 25 o 50 por página, entonces la tabla vuelve a la página 1 con ese tamaño.
- Cuando paso de página, entonces la tabla anterior se mantiene atenuada hasta que llegan los datos nuevos (sin parpadeo ni salto).
- Cuando hago clic en el encabezado de una columna ordenable, entonces se ordena ascendente y, con otro clic, descendente; el encabezado indica el orden (`aria-sort`).

**CA-04-2 Búsqueda**
- Cuando escribo en el buscador, entonces la tabla se filtra por nombre, apellido, email (y ciudad) tras una breve pausa al escribir (sin una petición por tecla) y vuelve a la página 1.

**CA-04-3 Filtros en el sidebar**
- El sidebar izquierdo tiene: estado (todos, activos, inactivos), ciudad, rango de fecha de nacimiento y rango de fecha de alta, más "Limpiar filtros".
- Cuando la fecha "desde" es posterior a "hasta", entonces veo el error en el campo y no se aplica el filtro.
- Cuando colapso el sidebar, entonces la tabla ocupa todo el ancho; al recargar, el sidebar sigue colapsado.
- Un contador en el botón del sidebar indica cuántos filtros hay activos.

**CA-04-4 URL sincronizada**
- Cuando aplico filtros, orden o página, entonces la URL los refleja (p. ej. `/customers?search=perez&active=true&page=2&sort=lastName,asc`).
- Cuando abro esa URL en otra pestaña, entonces veo el mismo resultado.
- Cuando uso el botón atrás del navegador, entonces se restauran los filtros anteriores.
- Parámetros inválidos en la URL se ignoran sin romper la página.

**CA-04-5 Estados**
- Mientras carga por primera vez, veo un indicador de carga en la tabla.
- Sin resultados, veo un estado vacío que ofrece limpiar los filtros (o, si es una página fuera de rango, ir a la primera).
- Si la API falla, veo el mensaje de error y un botón para reintentar.

**CA-04-6 Detalle**
- Cuando abro un cliente, entonces veo todos sus datos, la fecha de alta y la de última modificación ("Sin cambios" si es `null`).

**CA-04-7 Alta y edición (ADMIN)**
- El formulario valida lo mismo que el backend (obligatorios, máximos, email válido, fecha de nacimiento pasada) con mensajes en español.
- Cuando el backend responde 400 con errores por campo, entonces cada error aparece bajo su campo.
- Cuando el email ya existe (409), entonces el error aparece bajo el campo email.
- Cuando guardo con éxito, entonces vuelvo al listado y veo el flash "Cliente «Nombre Apellido» creado" (o "actualizado").

**CA-04-8 Eliminación (ADMIN)**
- Cuando pulso "Eliminar" en una fila, entonces se abre el modal "¿Eliminar a «Nombre Apellido»?" con **Confirmar** y **Cancelar** (nunca `confirm()`).
- Cuando confirmo, entonces el cliente desaparece de la tabla y veo el flash "Cliente eliminado".
- Si eliminé el último cliente de una página que no es la primera, entonces paso a la página anterior.
- Si la eliminación falla, entonces el error se muestra dentro del modal.

**CA-04-9 Permisos**
- Como USER no veo los botones de crear, editar ni eliminar; si abro `/customers/new` o `/customers/:id/edit`, voy a "Sin permiso".

**CA-04-10 Exportación**
- Cuando elijo CSV, Excel, PDF o XML, entonces se descarga un archivo con **todos** los clientes que cumplen los filtros y el orden actuales (no solo la página visible).
- Mientras se genera, el botón muestra el estado de carga; si falla, veo un flash de error.
- USER y ADMIN pueden exportar.

## Requisitos funcionales

| ID | Requisito |
|---|---|
| RF-04-01 | Tabla paginada de clientes con columnas definidas, rango "Mostrando a–b de N", tamaños 10 / 25 / 50 y navegación entre páginas. |
| RF-04-02 | Orden por columna (asc / desc) sobre los campos permitidos por la API, con `aria-sort`. |
| RF-04-03 | Búsqueda por nombre, apellido, email y ciudad con debounce en el handler. |
| RF-04-04 | Filtros en el sidebar izquierdo: estado, ciudad, rango de nacimiento y rango de alta; validación `desde <= hasta`; limpiar filtros; contador de filtros activos. |
| RF-04-05 | Filtros, orden, tamaño y página sincronizados con la URL; cambiar un filtro vuelve a la página 1; el botón atrás restaura; parámetros inválidos se ignoran. |
| RF-04-06 | Estados de carga, vacío, error con reintento y datos previos atenuados al paginar. |
| RF-04-07 | Página de detalle con fechas de auditoría. |
| RF-04-08 | Alta y edición (ADMIN) con React Hook Form + Zod equivalentes al backend y errores del servidor por campo (400 y 409 de email). |
| RF-04-09 | Eliminación (ADMIN) con modal de confirmación, error dentro del modal y retroceso de página si queda vacía. |
| RF-04-10 | Mensajes flash al crear, editar y eliminar, y flash de error cuando la acción falla fuera de un formulario o modal. |
| RF-04-11 | USER en solo lectura: sin acciones de escritura y con rutas de escritura protegidas. |
| RF-04-12 | Exportación a CSV, Excel, PDF y XML del resultado filtrado y ordenado completo, para USER y ADMIN. |
| RF-04-13 | `README.md` y `CLAUDE.md` documentan las pantallas de clientes y el contrato paginado. |

## Requisitos no funcionales

| ID | Requisito |
|---|---|
| RNF-04-01 | Ningún componente usa `useEffect` para traer datos, derivar la lista ni reaccionar a acciones del usuario. |
| RNF-04-02 | Las fechas `yyyy-MM-dd` se muestran sin desfase de zona horaria (formato `es-CL`). |
| RNF-04-03 | La tabla es usable a 375 px (scroll horizontal dentro de la tabla, no de la página). |

## Fuera de alcance

- Edición en línea en la tabla y selección múltiple / borrado masivo.
- Exportación de un solo cliente (existe en la API, se puede agregar después).
