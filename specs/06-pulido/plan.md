# Plan técnico — Spec 06

Cómo se implementa [`spec.md`](spec.md) respetando la [constitución](../constitution.md).

## 1. Resumen (`src/pages/DashboardPage.tsx`)

| Cifra | Consulta | Enlace |
|---|---|---|
| Clientes | `GET /api/customers?size=1` → `page.totalElements` | `/customers` |
| Activos | `?active=true&size=1` | `/customers?active=true` |
| Nuevos este mes | `?createdFrom=<día 1 del mes>&size=1` | `/customers?createdFrom=…` |
| Usuarios (ADMIN) | `GET /api/users?size=1` | `/users` |

Hook `useDashboardStats()` con `useQueries` (una query por cifra, reutilizando los
servicios). La fecha del día 1 se calcula en el hook (no en el render de un componente
que deba ser puro sin necesidad). Diseño según `specs/02-base-frontend/design.md`.

## 2. Estados y navegación

| Archivo | Contenido |
|---|---|
| `src/components/ui/TableSkeleton.tsx` | filas de esqueleto con `aria-busy` en la tabla |
| `src/components/ui/EmptyState.tsx` | revisar textos y acciones en cada uso |
| `src/hooks/useDocumentTitle.ts` | `useEffect` que sincroniza `document.title` (sistema externo) |
| `src/components/ui/PageHeader.tsx` | `h1` con `tabIndex={-1}` y foco al cambiar de ruta (efecto que depende de `location.pathname`) |

## 3. Responsive y accesibilidad

- Revisar a 375 px y en escritorio: header (navegación compacta), drawer de filtros, tablas, formularios y modales.
- Auditoría con Lighthouse / axe (skill `chrome-devtools-mcp:a11y-debugging` si está disponible): contraste, nombres accesibles, foco, `aria-*`, orden de tabulación.
- Confirmar `prefers-reduced-motion` en flash, modal y drawer.

## 4. Cierre

- Quitar `src/pages/DevUiPage.tsx` y su ruta.
- `README.md` del frontend: estructura real, capturas opcionales, flujo de sesión, funcionalidades.
- `CLAUDE.md` del frontend: stores, `setAuthHandlers`, contrato paginado, convención URL ↔ filtros, `userRules`.
- `3-spring-api/README.md`: enlace al repositorio del frontend.
- `specs/README.md`: todas las fases en "Hecha".

## 5. Trazabilidad

| Requisito | Tareas |
|---|---|
| RF-06-01 | F-01 |
| RF-06-02 | F-02 |
| RF-06-03 | F-02 |
| RF-06-04 | F-03 |
| RF-06-05 | F-03 |
| RF-06-06 | F-04 |
| RNF-06-01 | F-01 |
