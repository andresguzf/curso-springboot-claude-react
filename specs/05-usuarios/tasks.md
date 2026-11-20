# Tareas — Spec 05 (Fase E)

Se ejecutan **una a una** con la skill `sdd-next-task`. Definición de "hecho" en la
[constitución](../constitution.md#6-calidad-definición-de-hecho). Requiere el backend
con A-09 (listado de usuarios) y A-10 (último admin) hechas.

- [x] **E-01** Esquemas, servicio y hooks de usuarios
  - Depende de: D-02, A-09
  - Cubre: RF-05-01, RF-05-02
  - Archivos: `src/schemas/user.ts`, `src/services/userService.ts`, `src/hooks/useUrlFilters.ts` (generalización), `src/hooks/useCustomerFilters.ts` (usa la generalización), `src/hooks/useUserFilters.ts`, `src/hooks/useUsers.ts` (`userKeys`, `useUsersPage`, `useUser`, `useActiveAdminCount`)
  - Hecho cuando: el listado de usuarios se valida con Zod; los filtros de usuarios y de clientes comparten `useUrlFilters` sin cambiar su comportamiento; `useActiveAdminCount` usa `totalElements`
  - Verificación: `npm run build && npm run lint`; los filtros de clientes siguen funcionando en el navegador
  - Commit: "Agrega esquemas, servicio y hooks de usuarios con filtros en la URL"

- [x] **E-02** Listado de usuarios con búsqueda y filtros
  - Depende de: E-01, D-03, B-08
  - Cubre: RF-05-01, RF-05-02, RF-05-11
  - Archivos: `src/components/users/{UserFilters,UserTable,RoleBadge}.tsx`, `src/pages/UsersPage.tsx`, `src/App.tsx` (rutas ADMIN), `src/components/layout/Navbar.tsx`
  - Hecho cuando: tabla paginada y ordenable; buscador por email; filtros de rol y estado en el sidebar; URL compartible; USER no ve "Usuarios" y va a `/forbidden`
  - Verificación: `npm run build && npm run lint`; en el navegador como ADMIN y como USER
  - Commit: "Agrega el listado de usuarios con búsqueda y filtros por rol y estado"

- [x] **E-03** Ficha, alta y edición de usuarios
  - Depende de: E-02, D-06
  - Cubre: RF-05-03, RF-05-04, RF-05-05, RF-05-09
  - Archivos: `src/schemas/user.ts` (`userCreateSchema`, `userUpdateSchema`), `src/services/userService.ts` (`create`, `update`), `src/hooks/useUsers.ts` (mutaciones), `src/components/users/UserForm.tsx`, `src/pages/{UserDetailPage,UserCreatePage,UserEditPage}.tsx`
  - Hecho cuando: password obligatoria al crear y opcional al editar; 409 de email bajo el campo; flash al crear y editar; degradar a un ADMIN desde el formulario pide confirmación
  - Verificación: `npm run build && npm run lint`; en el navegador: crear USER y ADMIN, editar sin cambiar la contraseña, email duplicado
  - Commit: "Agrega ficha, alta y edición de usuarios"

- [ ] **E-04** Acciones rápidas, eliminación y reglas de administradores en la UI
  - Depende de: E-03, B-07, A-10
  - Cubre: RF-05-05, RF-05-06, RF-05-07, RF-05-08, RF-05-09, RNF-05-01, RNF-05-02
  - Archivos: `src/lib/userRules.ts`, `src/components/users/UserTable.tsx`, `src/pages/{UsersPage,UserDetailPage}.tsx`, `src/hooks/useUsers.ts` (`useDeleteUser`)
  - Hecho cuando: cambiar rol y habilitar / deshabilitar desde la fila con flash; eliminar, degradar y deshabilitar a un ADMIN piden `ConfirmDialog`; en la fila propia y en la del único admin habilitado esas acciones están deshabilitadas con el motivo visible y accesible; un 409 se muestra en el modal o en un flash
  - Verificación: `npm run build && npm run lint`; en el navegador con dos admins (degradar funciona) y con uno solo (UI bloquea); forzar el PUT con curl y ver el 409
  - Commit: "Agrega cambio de rol, estado y eliminación de usuarios con las reglas de administradores"

- [ ] **E-05** Cambios sobre el propio usuario
  - Depende de: E-04, C-01
  - Cubre: RF-05-10
  - Archivos: `src/hooks/useUsers.ts` (`useUpdateUser`: detectar edición propia), `src/services/authService.ts` (si hace falta)
  - Hecho cuando: cambiar el propio email mantiene la sesión (refresh inmediato y `setUser`); cambiar la propia contraseña muestra el flash y hace logout
  - Verificación: `npm run build && npm run lint`; en el navegador con un admin de prueba (no el admin inicial del `.env`)
  - Commit: "Mantiene la sesión al cambiar el propio email y cierra sesión al cambiar la propia contraseña"

- [ ] **E-06** Documentar la fase E
  - Depende de: E-05
  - Cubre: RF-05-12
  - Archivos: `README.md`, `CLAUDE.md`, `specs/05-usuarios/spec.md` (estado: Hecha), `specs/README.md` (estado)
  - Hecho cuando: el README describe la administración de usuarios y las reglas de administradores; `CLAUDE.md` explica `userRules`, `useActiveAdminCount` y los casos sobre el propio usuario
  - Verificación: `npm run build && npm run lint`
  - Commit: "Documenta la administración de usuarios"
  - Al cerrar: preguntar al usuario si hace merge a `main` y push
