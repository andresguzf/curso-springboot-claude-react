# Plan técnico — Spec 08

Cómo se implementa [`spec.md`](spec.md) respetando la [constitución](../constitution.md).

## 1. Contrato con la API

No cambia el backend. Se usa un endpoint que ya existe (ver `../3-spring-api/README.md`, «Formatos de exportación»):

| Método y ruta | Roles | `Accept` / `?format=` | Respuesta |
|---|---|---|---|
| `GET /api/customers/{id}?format=pdf` | USER, ADMIN | `application/pdf` / `pdf` | `200` con la ficha del cliente en PDF (`Content-Disposition` sugiere `cliente-{id}.pdf`) · `401` sin sesión (renovación con `refreshOnce`) · `404` `ProblemDetail` si no existe |

## 2. Piezas

| Pieza | Cómo |
|---|---|
| `src/components/layout/UserMenu.tsx` | El `<button>` de texto pasa a `IconButton` con `icon={LogOut}`, `tone="band"`, `isPending={logout.isPending}` y `label` «Cerrar sesión» (o «Cerrando sesión…» mientras carga). |
| `src/pages/DashboardPage.tsx` | `StatRow` recibe `icon: LucideIcon` y lo dibuja en un recuadro de 40 px `bg-accent-soft text-accent-strong` (tokens que ya existen en los dos temas). Iconos: `Users`, `UserCheck`, `UserPlus`, `ShieldUser`. |
| `src/services/customerService.ts` | `exportPdf(id)` → `http.download('/api/customers/{id}?format=pdf', EXPORT_FORMATS.pdf.accept, 'cliente-{id}.pdf')`. |
| `src/hooks/useExportCustomers.ts` | `useExportCustomerPdf()`: mutación con `saveFile` en `onSuccess` y flash de error en `onError`, como `useExportCustomers`. |
| `src/pages/CustomerDetailPage.tsx` | `IconButton` «Exportar a PDF» (`FileDown`) en las acciones del `PageHeader`, entre «Volver a clientes» y «Editar», para todos los roles. |

## 3. Decisiones

- **Un botón de icono directo, sin menú**: la ficha solo se exporta en PDF, así que no hace falta el `ExportMenu` del listado. Se usa `FileDown` (no `Download`) para distinguirlo del menú de formatos.
- **Cerrar sesión como icono**: sigue el patrón de la fase 07 (las acciones se identifican por icono y nombre accesible); el email y el rol siguen en texto porque son información, no acciones.
- **Recuadro del icono con `accent-soft` / `accent-strong`**: el acento nunca va como color de texto ni de icono (constitución y `design.md`); `accent-strong` sobre `accent-soft` ya cumple ≥ 4,5:1 en ambos temas.

## 4. Riesgos

- La ayuda del botón de PDF (a la izquierda) tapa momentáneamente «Volver a clientes» al pasar el puntero; es el mismo comportamiento de los demás botones de icono.

## 5. Trazabilidad

| Requisito | Tareas |
|---|---|
| RF-08-01 | H-01 |
| RF-08-02 | H-02 |
| RF-08-03 | H-03 |
| RF-08-04 | H-04 |
| RNF-08-01 | H-01, H-02, H-03 |
| RNF-08-02 | H-03 |
