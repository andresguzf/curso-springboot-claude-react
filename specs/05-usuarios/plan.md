# Plan técnico — Spec 05

Cómo se implementa [`spec.md`](spec.md) respetando la [constitución](../constitution.md).
Contrato de la API: `../3-spring-api/specs/01-paginacion-filtros-admin/plan.md`.

## 1. Contrato usado

| Endpoint | Uso |
|---|---|
| `GET /api/users?search&role&enabled&page&size&sort` | listado paginado → `{content, page}`; orden permitido `id, email, role, enabled, createdAt` |
| `GET /api/users/{id}` | ficha |
| `POST /api/users` `{email, password, role, enabled}` | alta; 409 si el email existe |
| `PUT /api/users/{id}` `{email, role, enabled, password?}` | edición completa (no hay PATCH); 409 por reglas de admin |
| `DELETE /api/users/{id}` | eliminación; 409 por reglas de admin |

Mensajes 409 del backend ("Operación no permitida"):
"No puedes quitarte el rol ADMIN ni deshabilitar tu propio usuario", "No puedes borrar tu propio usuario",
"Debe quedar al menos un administrador habilitado".

Al cambiar rol, contraseña o estado, el backend revoca los refresh tokens del usuario afectado.

## 2. Esquemas, servicio y hooks

| Archivo | Contenido |
|---|---|
| `src/schemas/user.ts` | `userPageSchema = pagedSchema(userSchema)`; `USER_SORT_FIELDS`; `userFiltersSchema` (`search`, `role`, `enabled`, `page`, `size`, `sort` con `.catch()`; orden por defecto `email,asc`, como el backend) — E-01; `userCreateSchema` (password 8–72 obligatoria) y `userUpdateSchema` (password `''` u 8–72) — E-03 |
| `src/schemas/common.ts` | `PAGE_SIZES`, `pageParam`, `sizeParam` y `sortParam(fields, fallback)`: parámetros de listado en la URL compartidos por clientes y usuarios (movidos desde `customer.ts` sin cambiar su comportamiento) |
| `src/services/userService.ts` | `page(filters)` (página 1 → 0) y `get(id)` — E-01; `create`, `update(id, values)` (omite `password` vacía) y `remove(id)` — E-03 / E-04 |
| `src/hooks/useUrlFilters.ts` | `useUrlFilters(schema, config)`: toda la lógica de URL ↔ filtros (vuelta a la página 1, historial al escribir con `state.textEdit`, valores por defecto omitidos, `clearFilters` + `resetKey`, `activeCount`, `hasFilters`). `config` (constante de módulo): `textFields`, `cleared`, `countActive`. `useCustomerFilters` pasa a ser `useUrlFilters(customerFiltersSchema, CUSTOMER_FILTERS)` |
| `src/hooks/useUserFilters.ts` | `useUrlFilters(userFiltersSchema, USER_FILTERS)`: texto `search`; cuenta rol y estado |
| `src/hooks/useUsers.ts` | `userKeys` (`all`, `list`, `detail`, `activeAdmins`), `useUsersPage` (`keepPreviousData`), `useUser`, `useActiveAdminCount()` (`role=ADMIN&enabled=true&size=1` con `select` → `page.totalElements`) — E-01; `useCreateUser`, `useUpdateUser`, `useDeleteUser` (invalidan `userKeys.all` y publican el flash) — E-03 / E-04 |
| `src/lib/userRules.ts` | funciones puras: `canDelete(user, me, activeAdmins)`, `canChangeRole(…)`, `canDisable(…)` → `{ allowed: boolean, reason?: string }` |

## 3. Componentes y páginas

| Archivo | Contenido |
|---|---|
| `src/components/users/UserFilters.tsx` | rol y estado en el `FiltersSidebar` |
| `src/components/users/UserTable.tsx` | `DataTable` con `RoleBadge`, estado y menú de acciones por fila según `userRules` |
| `src/components/users/RoleBadge.tsx` | badge USER / ADMIN |
| `src/components/users/UserForm.tsx` | presentacional; modo `create` / `edit` (password obligatoria u opcional) |
| `src/pages/UsersPage.tsx` | `FiltersLayout` + buscador + tabla + paginación + `ConfirmDialog` (eliminar, degradar, deshabilitar) |
| `src/pages/UserDetailPage.tsx` | ficha con acciones |
| `src/pages/UserCreatePage.tsx`, `src/pages/UserEditPage.tsx` | formulario; edición con `key={user.id}`; confirmación si el cambio degrada a un ADMIN |

Rutas `users`, `users/new`, `users/:id`, `users/:id/edit` dentro de `RequireRole role="ADMIN"`;
`NAV_ITEMS` con `roles: ['ADMIN']` para "Usuarios".

## 4. Acciones rápidas

Un `PUT` completo armado desde la fila: `{ email, role, enabled }` (sin `password` ni fechas).
Un único estado local de la página describe la acción pendiente:

```ts
type PendingAction =
  | { kind: 'delete'; user: User }
  | { kind: 'demote'; user: User }
  | { kind: 'disable'; user: User }
  | null
```

El `ConfirmDialog` se configura según `kind`; al confirmar se llama a la mutación
correspondiente; el error 409 se pasa a la prop `error` del modal. Promover a ADMIN y
habilitar no piden confirmación.

## 5. Casos sobre el propio usuario

| Caso | Qué hace la UI | Motivo |
|---|---|---|
| Cambio del propio email | tras el `onSuccess`, `authService.refresh()` y `setUser` | el JWT trae el email anterior como `sub`; sin renovar, `/me` responde 404 y el backend deja de reconocerlo como "uno mismo" |
| Cambio de la propia contraseña | flash "Contraseña cambiada, inicia sesión de nuevo" y logout | el backend revoca sus refresh tokens |
| Rol o estado propio | acciones deshabilitadas en la UI | el backend responde 409 |

## 6. Decisiones

| Decisión | Motivo |
|---|---|
| `userRules` como funciones puras | Se prueban y reutilizan en tabla, ficha y formulario sin duplicar condiciones. |
| `useActiveAdminCount` con `size=1` | Usa el conteo del servidor (`totalElements`) sin traer todos los usuarios. |
| Confirmación al degradar o deshabilitar un ADMIN | Es una acción con efecto sobre el acceso de otra persona y se aplica con hasta 15 min de retraso. |

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| Conteo de admins desactualizado | Se invalida `userKeys.all` tras cada mutación; el backend decide con 409. |
| PUT completo pisa cambios de otro admin | Aceptado (invalidación tras cada mutación); mejora posible con `@Version` en el backend. |

## 8. Trazabilidad

| Requisito | Tareas |
|---|---|
| RF-05-01 | E-01, E-02 |
| RF-05-02 | E-01, E-02 |
| RF-05-03 | E-03 |
| RF-05-04 | E-03 |
| RF-05-05 | E-03, E-04 |
| RF-05-06 | E-04 |
| RF-05-07 | E-04 |
| RF-05-08 | E-04 |
| RF-05-09 | E-03, E-04 |
| RF-05-10 | E-05 |
| RF-05-11 | E-02 |
| RF-05-12 | E-06 |
| RNF-05-01 | E-04 |
| RNF-05-02 | E-04 |
