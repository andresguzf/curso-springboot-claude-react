# Plan técnico — Spec 07

Cómo se implementa [`spec.md`](spec.md) respetando la [constitución](../constitution.md).
No cambia el contrato con el backend.

## 1. Bundle por ruta

Situación actual: un solo chunk de JavaScript de **555,66 kB** (169,90 kB gzip) y la advertencia de Vite.

| Pieza | Cómo |
|---|---|
| `src/App.tsx` | Cada página con la propiedad `lazy` de las rutas de React Router: `{ path: 'customers', lazy: () => import('./pages/CustomersPage.tsx').then((m) => ({ Component: m.CustomersPage })) }`. Layouts (`AppLayout`, `AuthLayout`), `RequireAuth`, `RequireRole` y `RouteErrorPage` quedan en el chunk inicial: se necesitan siempre. |
| Indicador de navegación | `useNavigation().state === 'loading'` en `AppLayout` (y `AuthLayout`): una barra fina en el borde superior, con `role="progressbar"` sin valor y `aria-label`, y sin animación con `prefers-reduced-motion`. La pantalla anterior se mantiene hasta que llega la nueva (comportamiento por defecto de `lazy`). |
| Dependencias compartidas | Si tras la división el chunk inicial sigue cerca del límite, `build.rolldownOptions.output.codeSplitting` (o `manualChunks`) separa las librerías grandes (React, TanStack Query, Zod) en chunks de proveedor. Se decide midiendo. |

Se documenta una tabla de tamaños antes / después (chunk inicial, chunk por página) en este plan al cerrar G-01.

**Decisión**: `lazy` del router en vez de `React.lazy` + `Suspense`: el router descarga el código **antes** de cambiar de pantalla (sin `fallback` que parpadee), funciona con las rutas de datos que ya usamos y no obliga a envolver cada página.

## 2. Iconos

| Pieza | Contenido |
|---|---|
| Dependencia | `lucide-react@latest`: iconos de trazo (1,5–2 px), minimalistas, con un solo import por icono (el bundle solo incluye los que se usan). Se agrega a la lista del stack en la constitución (§1) en la misma tarea. |
| `src/components/ui/IconButton.tsx` | `button` de 32 × 32 px (área táctil suficiente) con `aria-label` obligatorio, `tone` (`neutral` / `danger`), `disabled` y `aria-describedby` pasados al botón. Ayuda visible (`label`) en un tooltip propio que aparece con `:hover` y `:focus-visible` (CSS, sin `title`, que no sirve en táctil ni con teclado); el icono es `aria-hidden`. |
| Iconos (propuesta) | Editar `Pencil`, Eliminar `Trash2`, Cambiar a Administrador `ShieldCheck`, Cambiar a Usuario `ShieldMinus`, Deshabilitar `UserX`, Habilitar `UserCheck`; paginación `ChevronsLeft`, `ChevronLeft`, `ChevronRight`, `ChevronsRight`; tema `Sun` / `Moon`. Tamaño 16–18 px, `strokeWidth` 1.75, color `ink-muted` que pasa a `ink` en hover; eliminar en `danger`. |
| Uso | `CustomerTable` (Editar, Eliminar), `UserTable` / `UserActions` (Editar, Cambiar rol, Habilitar / Deshabilitar, Eliminar) y la sección «Acciones» de `UserDetailPage`. El motivo de una regla de administradores se sigue mostrando como texto bajo los iconos (`aria-describedby`). |
| Enlaces | «Editar» navega: se usa un `Link` con el mismo aspecto (`iconButtonClassName`) y el mismo tooltip, no un `button`. |

## 3. Paginación por rango

Función pura `pageWindow(current, total, radius)` en `src/lib/pagination.ts` (se prueba sin React):

| Total | Actual | Radio | Resultado |
|---|---|---|---|
| 20 | 7 | 3 | `… 4 5 6 [7] 8 9 10 …` |
| 20 | 2 | 3 | `1 [2] 3 4 5 …` |
| 20 | 19 | 3 | `… 16 17 18 [19] 20` |
| 5 | 3 | 3 | `1 2 [3] 4 5` |
| 1 | 1 | 3 | `[1]` (sin navegación) |

`Pagination.tsx`:

- Botones de icono «Primera página», «Página anterior», «Página siguiente», «Última página» (`IconButton`), deshabilitados en los extremos.
- Números de la ventana; la actual con `aria-current="page"` y fondo `accent-soft`.
- «…» como texto `aria-hidden` cuando hay páginas ocultas de ese lado.
- Móvil: se calcula la ventana de radio 3 y los números a más de 1 de la actual llevan `hidden sm:inline-flex` (solo CSS, sin `useMediaQuery`); el «…» de cada lado se muestra si hay páginas ocultas en ese tamaño.
- Se mantienen «Mostrando a–b de N» y «Por página».

## 4. Tema oscuro

### 4.1 Propuesta de paleta (G-04, a aprobar)

Punto de partida, inspirado en el modo oscuro de macOS con un tinte azul y violeta como acento. La tarea G-04 la ajusta con `frontend-design`, comprueba contrastes y la presenta para aprobación:

| Token | Claro (actual) | Oscuro (propuesta) | Uso |
|---|---|---|---|
| `canvas` | `#F2F3F5` | `#1B1F27` | fondo de la app |
| `surface` | `#FFFFFF` | `#242A35` | tablas, paneles, modal |
| `line` / `line-strong` | — | `#343B48` / `#4A5262` | bordes |
| `ink` / `ink-muted` | — | `#E6E9EF` / `#A1A9B8` | texto |
| `primary` (banda del header, botón principal) | `#1F2933` | `#11141A` banda · `#7C6CF2` botón | grafito → casi negro azulado; el botón principal pasa a violeta |
| `accent` / `accent-strong` / `accent-soft` | ámbar | `#8B7CF6` / `#B9AEFF` / `#2E2A4A` | violeta: navegación activa, foco, selección |
| `danger` / `success` / `warning` | — | `#F2867E` / `#6FD3A0` / `#E8B75C` | estados, ajustados para fondo oscuro |

### 4.2 Implementación (G-05)

| Pieza | Cómo |
|---|---|
| Tokens | Los colores siguen en `@theme`; el tema oscuro redefine las mismas variables en `:root[data-theme="dark"]` dentro de `src/index.css`. Los componentes no cambian (RNF-07-03). Se revisan los colores fijos que no son tokens (`text-white`, `bg-white/10`, sombras `rgb(...)`) y se pasan a tokens donde haga falta. `color-scheme: light / dark` para los controles nativos. |
| Preferencia | `uiStore` (ya persistido) suma `theme: 'system' \| 'light' \| 'dark'` (por defecto `'system'`) y `toggleTheme()`, que alterna entre claro y oscuro según el tema que se ve. |
| Aplicar el tema | `src/lib/theme.ts`: `resolveTheme(theme)` (con `matchMedia('(prefers-color-scheme: dark)')`) y `applyTheme()`, que pone `data-theme` en `<html>`. Se conecta a nivel de módulo en `main.tsx` (suscripción al store + listener de `matchMedia` cuando el tema es `'system'`): es sincronizar con el DOM, un sistema externo, sin `useEffect` en componentes. |
| Sin destello | Script en línea en `index.html` (antes del CSS) que lee `localStorage['ui']` y pone `data-theme` antes del primer pintado. |
| Selector | `src/components/layout/ThemeToggle.tsx` en el header (y en la esquina del `AuthLayout`): `IconButton` con `Sun` / `Moon` y `aria-label` «Cambiar a tema oscuro» / «Cambiar a tema claro». |

## 5. Decisiones

| Decisión | Motivo |
|---|---|
| `lazy` del router y no `React.lazy` | Descarga antes de cambiar de pantalla, sin `fallback` intermedio; encaja con `createBrowserRouter`. |
| `lucide-react` | Trazo fino y uniforme, coherente con la tipografía Atkinson y los bordes de 1 px; importa solo lo usado; licencia ISC. Alternativa descartada: SVG propios (más código que mantener). |
| Tooltip propio con CSS | `title` no aparece con teclado ni en táctil y su retardo no se controla. |
| Ventana ±1 en móvil, con CSS | ±3 más cuatro botones no cabe en 375 px; resolverlo con clases evita estado y effects. |
| Violeta solo en el tema oscuro | El ámbar sobre gris azulado oscuro pierde contraste y se ve terroso; el violeta da el acento frío que pide el tema. El claro conserva su identidad. |
| Tema por tokens y `data-theme` | Un solo juego de componentes; el tema es solo datos (RNF-07-03). |

## 6. Riesgos

| Riesgo | Mitigación |
|---|---|
| Destello del tema al recargar | Script en línea en `index.html` antes del CSS. |
| Colores fijos que no cambian con el tema | Búsqueda de `white`, `black`, `rgb(` y `#` en `src/` durante G-05 y prueba visual de cada pantalla en oscuro. |
| Iconos sin significado claro | Tooltip visible y nombre accesible con el verbo; el motivo de las reglas sigue en texto. |
| Chunk inicial aún grande tras dividir | Separar librerías de proveedor (§1) y medir. |

## 7. Trazabilidad

| Requisito | Tareas |
|---|---|
| RF-07-01 | G-01 |
| RF-07-02 | G-02 |
| RF-07-03 | G-02 |
| RF-07-04 | G-03 |
| RF-07-05 | G-04 |
| RF-07-06 | G-05 |
| RF-07-07 | G-06 |
| RNF-07-01 | G-01 |
| RNF-07-02 | G-05 |
| RNF-07-03 | G-05 |
