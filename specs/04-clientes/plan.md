# Plan técnico — Spec 04

Cómo se implementa [`spec.md`](spec.md) respetando la [constitución](../constitution.md).
Contrato de la API: `../3-spring-api/specs/01-paginacion-filtros-admin/plan.md`.

## 1. Contrato usado

| Endpoint | Uso |
|---|---|
| `GET /api/customers?search&active&city&birthFrom&birthTo&createdFrom&createdTo&page&size&sort` (JSON) | listado paginado → `{content, page}` |
| `GET /api/customers?…&format=csv|xlsx|pdf|xml` | exportación del resultado filtrado completo |
| `GET /api/customers/{id}` | detalle |
| `POST /api/customers`, `PUT /api/customers/{id}`, `DELETE /api/customers/{id}` | escritura (ADMIN) |

`CustomerDto`: `{id, name, lastName, email, phone, address, city, birthDate, active, createdAt, updatedAt}`.
Orden permitido: `id, name, lastName, email, city, birthDate, active, createdAt, updatedAt`.
La página de la API empieza en 0; en la URL del frontend empieza en 1 (más natural para el usuario).

## 2. Esquemas (`src/schemas/customer.ts`)

| Esquema | Contenido |
|---|---|
| `customerSchema` | `birthDate: z.iso.date()`, `createdAt: z.iso.datetime({ local: true })`, `updatedAt: … .nullable()` |
| `customerPageSchema` | `pagedSchema(customerSchema)` |
| `customerFiltersSchema` | filtros de la URL con `.catch()` en cada campo: `search`, `active` (`'true' | 'false'`), `city`, `birthFrom`, `birthTo`, `createdFrom`, `createdTo`, `page` (≥ 1, por defecto 1), `size` (10 / 25 / 50), `sort` (regex sobre la lista blanca, por defecto `id,asc`) |
| `customerFormSchema` | máximos 80 / 80 / 150 / 30 / 200 / 80, `z.email()`, `birthDate` pasada, `active: z.boolean()` |

`type CustomerFilters = z.infer<typeof customerFiltersSchema>`; los tipos de datos con `z.infer`.

## 3. Servicios y hooks

| Archivo | Contenido |
|---|---|
| `src/services/customerService.ts` | `page(filters)` (convierte `page - 1` y arma el query con `toQuery`), `get(id)`, `create`, `update`, `remove`, `exportFile(filters, format)` (con `http.download`) |
| `src/hooks/useCustomerFilters.ts` | `useSearchParams` + `customerFiltersSchema.parse` (cada campo con `.catch()`, nunca falla); `setFilters(patch)` (cualquier cambio que no sea de página vuelve a `page: 1`; texto: el primer cambio agrega una entrada al historial marcada con `state.textEdit` y los siguientes la reemplazan, así atrás vuelve a lo que había antes de escribir; filtros, página, orden y tamaño agregan una entrada); los valores por defecto no se escriben en la URL; `clearFilters()` (búsqueda y sidebar; conserva tamaño y orden); `activeCount` (estado, ciudad, rango de nacimiento y rango de alta; la búsqueda no cuenta) y `hasFilters` |
| `src/hooks/useDebouncedCallback.ts` | devuelve `{ run, cancel }`: debounce dentro del handler, timer en `useRef`, siempre ejecuta el callback más reciente (ref actualizado en `useLayoutEffect`), limpieza al desmontar (no un effect que observa el texto); `cancel` evita que una búsqueda pendiente se aplique tras "Limpiar filtros" |
| `src/hooks/useCustomers.ts` | `customerKeys` (`all`, `list(filters)`, `detail(id)`), `useCustomersPage(filters)` con `placeholderData: keepPreviousData`, `useCustomer(id)`, `useCreateCustomer`, `useUpdateCustomer`, `useDeleteCustomer` (invalidan `customerKeys.all` y publican el flash en `onSuccess`) |
| `src/hooks/useExportCustomers.ts` | mutación que descarga con un object URL temporal y `<a download>`; flash de error en `onError` |
| `src/lib/format.ts` | `formatDate('1990-05-20')` separando el string (sin `new Date`, que interpreta UTC y en Chile mostraría el día anterior); `formatDateTime` con `Intl.DateTimeFormat('es-CL')` |
| `src/lib/serverErrors.ts` | `applyServerErrors(error, setError)`: 400 con `fieldErrors` → `setError` por campo; 409 "Recurso duplicado" → `setError('email')`; devuelve `false` si no aplicó nada |

## 4. Componentes y páginas

| Archivo | Contenido |
|---|---|
| `src/components/ui/DataTable.tsx` | genérico: `columns: { key, header, sortField?, cell, className? }[]`, `rows`, `getRowId`, `sort`, `onSortChange`, `isDimmed`, `empty` (contenido si no hay filas); `caption` oculto; botón en el encabezado con `aria-sort` (primer clic asc, luego alterna); encabezado fijo y scroll propio (`max-h-[70vh] overflow-auto`, horizontal a 375 px) |
| `src/components/ui/Pagination.tsx` | "Mostrando a–b de N" ("Sin resultados" si no hay), anterior / siguiente / números con elipsis (máx. 7: `1 … 5 6 7 … 12`), página actual con `aria-current`; selector de tamaño con las opciones de la prop `sizes`; `nav aria-label="Paginación"` |
| `src/components/filters/DateRangeField.tsx` | dos `input type="date"` con validación `desde <= hasta` |
| `src/components/customers/CustomerFilters.tsx` | contenido del `FiltersSidebar` (estado, ciudad, rangos) |
| `src/components/customers/CustomerSearch.tsx` | buscador de la barra superior; estado local que se ajusta en el render si cambia la URL (patrón `prevSearch`), debounce en el `onChange` |
| `src/components/customers/CustomerTable.tsx` | columnas y acciones por fila (ver, editar, eliminar) según `isAdmin` |
| `src/components/customers/CustomerForm.tsx` | presentacional: `defaultValues`, `onSubmit`, `isPending`; recibe `setError` vía callback o expone el form para `applyServerErrors` |
| `src/components/customers/ExportMenu.tsx` | menú con CSV, Excel, PDF y XML |
| `src/pages/CustomersPage.tsx` | `FiltersLayout` + `PageHeader` (Nuevo cliente, Exportar) + tabla + paginación + `ConfirmDialog` de eliminación |
| `src/pages/CustomerDetailPage.tsx` | ficha con fechas de auditoría |
| `src/pages/CustomerCreatePage.tsx`, `src/pages/CustomerEditPage.tsx` | formulario; edición con `key={customer.id}`; navegan en `onSuccess` |

Rutas: `customers`, `customers/:id` (todos); `customers/new`, `customers/:id/edit` dentro de `RequireRole role="ADMIN"`.

## 5. Decisiones

| Decisión | Motivo |
|---|---|
| Filtros en la URL, no en Zustand | Enlaces compartibles y botón atrás gratis; una sola fuente de verdad. |
| `keepPreviousData` + atenuado | Sin parpadeo al paginar; `isPlaceholderData` indica que hay datos viejos. |
| Exportación con `http.download`, no `<a href>` | Un enlace directo con el access token vencido descargaría un `ProblemDetail`; así pasa por el refresh. El PDF también se descarga (abrir una ventana tras un `await` lo bloquea el navegador). |
| Retroceder de página en `onSuccess` del borrado | Evita una página vacía sin usar effects. |
| Página 1 en la URL, 0 en la API | Mejor para el usuario; la conversión vive solo en el servicio. |

## 6. Riesgos

| Riesgo | Mitigación |
|---|---|
| Desfase de un día en fechas | `formatDate` sin `Date` (RNF-04-02). |
| `?page=99` fuera de rango | Estado vacío con "Ir a la primera página". |
| Debounce que dispara tras desmontar | Limpieza del timer en el hook. |

## 7. Trazabilidad

| Requisito | Tareas |
|---|---|
| RF-04-01 | D-01, D-03, D-05 |
| RF-04-02 | D-03, D-05 |
| RF-04-03 | D-02, D-05 |
| RF-04-04 | D-04 |
| RF-04-05 | D-02 |
| RF-04-06 | D-05 |
| RF-04-07 | D-05 |
| RF-04-08 | D-06 |
| RF-04-09 | D-07 |
| RF-04-10 | D-06, D-07 |
| RF-04-11 | D-05, D-06, D-07 |
| RF-04-12 | D-08 |
| RF-04-13 | D-09 |
| RNF-04-01 | D-02, D-05, D-06 |
| RNF-04-02 | D-01 |
| RNF-04-03 | D-03 |
