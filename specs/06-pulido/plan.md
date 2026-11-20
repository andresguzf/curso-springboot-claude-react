# Plan técnico — Spec 06

Cómo se implementa [`spec.md`](spec.md) respetando la [constitución](../constitution.md).

## 1. Resumen (`src/pages/DashboardPage.tsx`)

| Cifra | Consulta | Enlace |
|---|---|---|
| Clientes | `GET /api/customers?size=1` → `page.totalElements` | `/customers` |
| Activos | `?active=true&size=1` | `/customers?active=true` |
| Nuevos este mes | `?createdFrom=<día 1 del mes>&size=1` | `/customers?createdFrom=…` |
| Usuarios (ADMIN) | `GET /api/users?size=1` | `/users` |

Hook `useDashboardStats({ includeUsers })` con `useQueries` (una query por cifra, `size=1` y
`select` → `totalElements`). Reutiliza `customerKeys.list` / `userKeys.list`: las mutaciones ya
invalidan esas claves y el resumen se actualiza solo. El mes (día 1 y nombre) se fija al montar
con el inicializador de `useState`, así la clave de la consulta queda estable. La consulta de
usuarios solo corre para ADMIN (`enabled`).

Diseño según `specs/02-base-frontend/design.md` («el fichero», sin número grande + gradiente ni
tarjetas iguales): un solo panel con una fila por cifra (frase, dato de contexto como «De 22
clientes» y el total en cifras tabulares a la derecha); toda la fila es un enlace al listado
filtrado, con el mismo hover neutro que las filas de la tabla. Si alguna cifra falla: «—» y
«Reintentar». `DashboardPage` reemplaza a `HomePage` en la ruta índice.

## 2. Estados y navegación

| Archivo | Contenido |
|---|---|
| `src/components/ui/TableSkeleton.tsx` | caja, cabecera y filas de 44 px como `DataTable` (la página no salta), `aria-busy`, texto «Cargando…» en `role="status"` y pulso con `motion-reduce:animate-none`; reemplaza al spinner en la primera carga de clientes y usuarios |
| `src/components/ui/EmptyState.tsx` | revisados todos los usos: el único sin acción («Todavía no hay clientes») ofrece «Nuevo cliente» al ADMIN; prop `titleAs="h1"` para los estados que son toda la página (no encontrado, error al cargar) |
| `src/hooks/useDocumentTitle.ts` | `useEffect` que sincroniza `document.title` (sistema externo) con «Página · Cartera»; lo llama cada página arriba (incluidas login, errores y fichas mientras cargan) |
| `src/components/ui/PageHeader.tsx` | `h1` con `tabIndex={-1}` y foco al llegar a una pantalla: un contador de pedidos de foco en estado (1 al montar tras navegar, 0 en la carga inicial con `location.key === 'default'`) que se ajusta en el render cuando cambia `pathname`; el effect depende de ese contador. Cambiar solo el query string (filtros, orden, página) no mueve el foco |

## 3. Responsive y accesibilidad

- Revisar a 375 px y en escritorio: header (navegación compacta), drawer de filtros, tablas, formularios y modales.
- Auditoría con Lighthouse / axe (skill `chrome-devtools-mcp:a11y-debugging` si está disponible): contraste, nombres accesibles, foco, `aria-*`, orden de tabulación.
- Confirmar `prefers-reduced-motion` en flash, modal y drawer.

**Resultado (F-03).** Lighthouse con Chrome DevTools MCP, en un contexto aislado y con un ADMIN de prueba:

| Pantalla | Accesibilidad antes | Después |
|---|---|---|
| Login (escritorio y móvil) | 95 | 100 |
| Clientes (escritorio y móvil) | 96 | 100 |
| Usuarios | 96 | 100 |
| Modal de eliminar abierto (snapshot) | — | 100 |
| Cajón de filtros a 375 px (snapshot) | — | 100 |

- Único problema de accesibilidad: la región de mensajes flash tenía `aria-label` en un `div` sin rol → pasa a `<section aria-label="Notificaciones">` (landmark de región).
- 375 px: sin desborde de página en resumen, clientes, usuarios, formularios, ficha y edición; las tablas se desplazan dentro de su recuadro; los filtros, en el cajón (foco inicial en «Cerrar filtros»).
- `prefers-reduced-motion`: el flash entra con `motion-safe:animate-flash-in`; spinner y esqueleto con `motion-reduce:animate-none`; modal y cajón no tienen animación de entrada.
- Fuera de accesibilidad: se agrega `<meta name="description">` y `public/robots.txt` con `Disallow: /` (panel privado; Lighthouse SEO lo marca como «bloqueado para indexar», es lo buscado). Los errores de consola del login son los 401 esperados de `/me` y `/refresh` sin sesión.

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
