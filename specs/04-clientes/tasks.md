# Tareas — Spec 04 (Fase D)

Se ejecutan **una a una** con la skill `sdd-next-task`. Definición de "hecho" en la
[constitución](../constitution.md#6-calidad-definición-de-hecho). Requiere el backend
con la tarea A-06 hecha (listado paginado y filtros).

- [x] **D-01** Esquemas, servicio y formateo de fechas de clientes
  - Depende de: C-03, A-06
  - Cubre: RF-04-01, RNF-04-02
  - Archivos: `src/schemas/customer.ts` (`customerSchema`, `customerPageSchema`, `customerFiltersSchema`), `src/services/customerService.ts` (`page`, `get`), `src/lib/format.ts`
  - Hecho cuando: `customerService.page(filters)` devuelve una página validada con Zod; `formatDate` no usa `Date` y `formatDateTime` usa `es-CL`
  - Verificación: `npm run build && npm run lint`; llamada de prueba desde la página (temporal) con el backend arriba
  - Commit: "Agrega esquemas, servicio y formateo de fechas de clientes"

- [x] **D-02** Filtros sincronizados con la URL y búsqueda con debounce
  - Depende de: D-01
  - Cubre: RF-04-03, RF-04-05, RNF-04-01
  - Archivos: `src/hooks/useCustomerFilters.ts`, `src/hooks/useDebouncedCallback.ts`
  - Hecho cuando: `setFilters` vuelve a la página 1 al cambiar un filtro y usa `replace` para texto; parámetros inválidos caen a sus valores por defecto; `activeCount` cuenta los filtros activos; el debounce vive en el handler
  - Verificación: `npm run build && npm run lint`
  - Commit: "Agrega filtros de clientes sincronizados con la URL y búsqueda con debounce"

- [x] **D-03** Tabla de datos y paginación reutilizables
  - Depende de: B-05
  - Cubre: RF-04-01, RF-04-02, RNF-04-03
  - Archivos: `src/components/ui/DataTable.tsx`, `src/components/ui/Pagination.tsx`, `src/pages/DevUiPage.tsx` (ejemplo con datos ficticios)
  - Hecho cuando: orden por columna con `aria-sort`; "Mostrando a–b de N"; selector 10 / 25 / 50; scroll horizontal dentro de la tabla a 375 px
  - Verificación: `npm run build && npm run lint`; revisar en `/dev/ui` con teclado y a 375 px
  - Commit: "Agrega tabla de datos con orden por columna y paginación reutilizables"

- [x] **D-04** Filtros de clientes en el sidebar
  - Depende de: B-08, D-02
  - Cubre: RF-04-04
  - Archivos: `src/components/filters/DateRangeField.tsx`, `src/components/customers/CustomerFilters.tsx`
  - Hecho cuando: estado, ciudad, rango de nacimiento y rango de alta actualizan la URL; `desde > hasta` muestra error y no se aplica; "Limpiar filtros"; contador en el botón del sidebar
  - Verificación: `npm run build && npm run lint`
  - Commit: "Agrega los filtros de clientes en el sidebar lateral"

- [x] **D-05** Página de listado y detalle de clientes
  - Depende de: D-03, D-04
  - Cubre: RF-04-01, RF-04-02, RF-04-03, RF-04-06, RF-04-07, RF-04-11, RNF-04-01
  - Archivos: `src/hooks/useCustomers.ts` (`customerKeys`, `useCustomersPage`, `useCustomer`), `src/components/customers/{CustomerSearch,CustomerTable}.tsx`, `src/pages/{CustomersPage,CustomerDetailPage}.tsx`, `src/App.tsx`, `src/components/layout/Navbar.tsx`
  - Hecho cuando: tabla paginada con datos reales, orden, búsqueda y filtros del sidebar; datos previos atenuados al paginar; estados de carga, vacío y error con reintento; detalle con fechas de auditoría; USER sin acciones de escritura
  - Verificación: `npm run build && npm run lint`; en el navegador: URL compartida en otra pestaña, botón atrás, sidebar colapsado tras recargar, `?page=99`
  - Commit: "Agrega el listado de clientes con paginación, orden, búsqueda y filtros"

- [x] **D-06** Alta y edición de clientes con validación y mensajes flash
  - Depende de: D-05, B-06
  - Cubre: RF-04-08, RF-04-10, RF-04-11, RNF-04-01
  - Archivos: `src/schemas/customer.ts` (`customerFormSchema`), `src/services/customerService.ts` (`create`, `update`), `src/hooks/useCustomers.ts` (mutaciones), `src/lib/serverErrors.ts`, `src/components/customers/CustomerForm.tsx`, `src/pages/{CustomerCreatePage,CustomerEditPage}.tsx`, `src/App.tsx` (rutas ADMIN)
  - Hecho cuando: validación equivalente al backend; 400 por campo y 409 en el email; flash "Cliente «…» creado / actualizado" desde `onSuccess`; edición con `key={id}`; USER → `/forbidden`
  - Verificación: `npm run build && npm run lint`; en el navegador: crear, editar, email duplicado, campo vacío forzado
  - Commit: "Agrega alta y edición de clientes con validación y mensajes flash"

- [x] **D-07** Eliminación de clientes con modal de confirmación
  - Depende de: D-06, B-07
  - Cubre: RF-04-09, RF-04-10, RF-04-11
  - Archivos: `src/services/customerService.ts` (`remove`), `src/hooks/useCustomers.ts` (`useDeleteCustomer`), `src/pages/CustomersPage.tsx`
  - Hecho cuando: "Eliminar" abre el `ConfirmDialog` con el nombre; confirmar elimina, muestra el flash y retrocede de página si quedó vacía; el error se ve dentro del modal; no hay `confirm()`
  - Verificación: `npm run build && npm run lint`; en el navegador: cancelar, Esc, confirmar, borrar el último de una página
  - Commit: "Agrega la eliminación de clientes con modal de confirmación"

- [x] **D-08** Exportación del resultado filtrado
  - Depende de: D-05, B-03
  - Cubre: RF-04-12
  - Archivos: `src/services/customerService.ts` (`exportFile`), `src/hooks/useExportCustomers.ts`, `src/components/customers/ExportMenu.tsx`, `src/pages/CustomersPage.tsx`
  - Hecho cuando: CSV, Excel, PDF y XML descargan todo el resultado con los filtros y el orden actuales; estado de carga en el botón; flash si falla; disponible para USER
  - Verificación: `npm run build && npm run lint`; el CSV filtrado tiene tantas filas como `totalElements`
  - Commit: "Agrega exportación del listado filtrado de clientes a CSV, Excel, PDF y XML"

- [x] **D-09** Documentar la fase D
  - Depende de: D-07, D-08
  - Cubre: RF-04-13
  - Archivos: `README.md`, `CLAUDE.md` (actualizar `GET /api/customers` al contrato paginado), `specs/04-clientes/spec.md` (estado: Hecha), `specs/README.md` (estado)
  - Hecho cuando: el README describe las funcionalidades de clientes y la tabla de endpoints con los parámetros nuevos; `CLAUDE.md` explica la convención URL ↔ filtros
  - Verificación: `npm run build && npm run lint`
  - Commit: "Documenta las pantallas de clientes"
  - Al cerrar: preguntar al usuario si hace merge a `main` y push
