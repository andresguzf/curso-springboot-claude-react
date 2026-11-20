# Spec 05 — Usuarios y roles

| | |
|---|---|
| Fase | E |
| Repo | `4-react` |
| Estado | En curso |
| Depende de | Spec 04 (componentes de tabla y filtros) y spec 01 del backend (A-09: listado de usuarios; A-10: último admin) |
| La necesitan | Spec 06 |
| Constitución | [`../constitution.md`](../constitution.md) |

## Resumen

Administración de usuarios para el rol ADMIN: listado paginado con búsqueda y
filtros, ficha, alta, edición, cambio de rol (`USER` ↔ `ADMIN`), habilitar o
deshabilitar y eliminación, reflejando en la interfaz las reglas de seguridad del
backend.

## Historias de usuario

- **HU-05-1** Como ADMIN quiero listar, buscar por email y filtrar usuarios por rol y estado, para administrarlos con rapidez.
- **HU-05-2** Como ADMIN quiero ver la ficha de un usuario (rol, estado, fechas), para revisar su situación.
- **HU-05-3** Como ADMIN quiero crear usuarios con email, contraseña, rol y estado, para dar acceso a nuevas personas.
- **HU-05-4** Como ADMIN quiero editar el email, el rol, el estado y, si hace falta, la contraseña de un usuario.
- **HU-05-5** Como ADMIN quiero cambiar el rol o habilitar/deshabilitar a un usuario directamente desde la tabla, para no entrar al formulario por un cambio simple.
- **HU-05-6** Como ADMIN quiero eliminar usuarios con una confirmación previa.
- **HU-05-7** Como ADMIN quiero que la interfaz me impida (y me explique por qué) eliminarme, degradarme o deshabilitarme, o dejar el sistema sin administradores.

## Criterios de aceptación

**CA-05-1 Listado**
- Cuando un ADMIN abre `/users`, entonces ve una tabla paginada con email, rol (badge), estado (habilitado / deshabilitado) y fecha de alta, ordenable por columna.
- El sidebar izquierdo (colapsable) tiene filtros de rol y estado; el buscador filtra por email; todo queda en la URL.

**CA-05-2 Ficha**
- Cuando abre un usuario, entonces ve email, rol, estado, fecha de alta y de última modificación, y las acciones permitidas.

**CA-05-3 Alta**
- La contraseña es obligatoria (8 a 72 caracteres); el rol se elige entre USER y ADMIN; habilitado por defecto.
- Un email duplicado (409) aparece bajo el campo email; los errores 400 aparecen por campo.
- Al guardar, vuelve al listado con el flash "Usuario «email» creado".

**CA-05-4 Edición**
- La contraseña es opcional: vacía conserva la actual; si se escribe, debe tener 8 a 72 caracteres.
- Al guardar, flash "Usuario «email» actualizado".
- Si cambio a ADMIN → USER a un administrador, primero se pide confirmación en un modal.

**CA-05-5 Acciones rápidas**
- Desde la fila puedo "Cambiar a ADMIN" / "Cambiar a USER" y "Habilitar" / "Deshabilitar"; al terminar veo el flash correspondiente ("Rol cambiado a ADMIN", "Usuario deshabilitado").
- Degradar a un administrador o deshabilitarlo pide confirmación en un modal que avisa: "Se cerrarán sus sesiones; el cambio se aplica en máximo 15 minutos".

**CA-05-6 Eliminación**
- "Eliminar" abre el modal de confirmación con el email del usuario; al confirmar, flash "Usuario eliminado".

**CA-05-7 Reglas de administradores**
- En mi propia fila, eliminar, cambiar el rol y deshabilitar están deshabilitados, con el motivo visible ("No puedes eliminar ni quitarte permisos a ti mismo").
- Si hay un solo ADMIN habilitado, en su fila esas mismas acciones están deshabilitadas con el motivo "Debe quedar al menos un administrador habilitado".
- Si aun así el backend responde 409 (por ejemplo, otro admin cambió algo en paralelo), el `detail` se muestra en el modal o en un flash de error y la tabla se actualiza.

**CA-05-8 Cambios sobre mi propio usuario**
- Si cambio mi propio email, sigo con la sesión activa (la aplicación renueva la sesión enseguida).
- Si cambio mi propia contraseña, veo el flash "Contraseña cambiada, inicia sesión de nuevo" y vuelvo al login.

**CA-05-9 Permisos**
- Un USER no ve "Usuarios" en la navegación y, si abre `/users`, va a "Sin permiso".

## Requisitos funcionales

| ID | Requisito |
|---|---|
| RF-05-01 | Tabla paginada y ordenable de usuarios (email, rol, estado, fecha de alta). |
| RF-05-02 | Búsqueda por email y filtros de rol y estado en el sidebar, sincronizados con la URL. |
| RF-05-03 | Ficha del usuario con fechas de auditoría y acciones permitidas. |
| RF-05-04 | Alta de usuario con contraseña obligatoria (8–72), rol USER / ADMIN y estado. |
| RF-05-05 | Edición de usuario con contraseña opcional y confirmación al degradar a un ADMIN. |
| RF-05-06 | Acciones rápidas en la tabla: cambiar rol y habilitar / deshabilitar, con confirmación al degradar o deshabilitar a un ADMIN. |
| RF-05-07 | Eliminación con modal de confirmación. |
| RF-05-08 | Reglas de administradores reflejadas en la UI (uno mismo, último ADMIN habilitado) con el motivo visible, y 409 mostrados al usuario. |
| RF-05-09 | Mensajes flash al crear, editar, cambiar rol o estado y eliminar. |
| RF-05-10 | Cambio del propio email → renovación inmediata de la sesión; cambio de la propia contraseña → logout con flash. |
| RF-05-11 | Toda la sección es solo para ADMIN (ruta protegida y navegación oculta). |
| RF-05-12 | `README.md` y `CLAUDE.md` documentan la administración de usuarios y sus reglas. |

## Requisitos no funcionales

| ID | Requisito |
|---|---|
| RNF-05-01 | El backend es la fuente de verdad: la UI anticipa las reglas pero nunca asume que la operación se hizo sin la respuesta de la API. |
| RNF-05-02 | Las acciones deshabilitadas explican el motivo de forma accesible (`aria-describedby`), no solo con un tooltip. |

## Fuera de alcance

- Crear, editar o borrar roles: por decisión del usuario se mantiene el enum `USER` / `ADMIN` (un rol por usuario).
- Cambio de la contraseña propia desde un perfil (no hay endpoint específico; se hace desde la edición del usuario).
- Exportación de usuarios.
