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

**Resultado (G-01)**, build de producción (sin gzip; entre paréntesis, gzip):

| | Antes | Después |
|---|---|---|
| Chunks de JavaScript | 1 de 555,7 kB (169,9) | librerías con nombre + código de la app + un chunk por página |
| Librerías (siempre, en caché entre despliegues) | — | `react` 218,7 (68,3) · `router` 95,8 (31,3) · `zod` 90,8 (25,6) · `query` 38,5 (11,2) |
| Código de la app inicial (`index`) | — | 15,1 (5,4) |
| Login (todo lo que descarga) | 555,7 | ~496 kB: lo anterior + `forms` 38 (React Hook Form) + `LoginPage` 2,3 y piezas mínimas |
| Al entrar a clientes | — | + `CustomersPage` 8,8 + `useUrlFilters` 13 y piezas (~25 kB) |
| Al entrar a usuarios | — | + `UsersPage` 5,1 + `useUserActions` 3,5 |
| Advertencia de 500 kB | sí | no |

- El grueso que se descarga siempre son las librerías (React DOM, el router, Zod —también lo usa `lib/http.ts` para validar respuestas— y TanStack Query). Por eso se separan en chunks de proveedor con `build.rolldownOptions.output.codeSplitting.groups` (`vite.config.ts`): un cambio en el código de la app no obliga a volver a descargarlas.
- Verificado en `npm run preview` con contextos aislados de Chrome: el login no descarga clientes ni usuarios; cada sección descarga sus chunks la primera vez y no al volver; la barra de navegación aparece durante la descarga; abrir directo una ruta diferida (`/customers?active=true`) usa el `hydrateFallbackElement` sin advertencias en consola.
- El router descarga el código de **todas** las rutas que coinciden antes de que `RequireRole` decida: un USER que abre `/users` descarga `UsersPage` y luego va a «Sin permiso». No es un problema de seguridad (el código del frontend es público y el backend responde 403); evitarlo exigiría mover la comprobación de rol a un `loader` (fuera de alcance).

**Decisión**: `lazy` del router en vez de `React.lazy` + `Suspense`: el router descarga el código **antes** de cambiar de pantalla (sin `fallback` que parpadee), funciona con las rutas de datos que ya usamos y no obliga a envolver cada página.

## 2. Iconos

| Pieza | Contenido |
|---|---|
| Dependencia | `lucide-react@latest`: iconos de trazo (1,5–2 px), minimalistas, con un solo import por icono (el bundle solo incluye los que se usan). Se agrega a la lista del stack en la constitución (§1) en la misma tarea. |
| `src/components/ui/IconButton.tsx` | `IconButton` (`button`) e `IconLink` (`Link`, para Editar, que navega), de 32 × 32 px, con `label` obligatorio (→ `aria-label`), `icon`, `tone` (`neutral` / `danger`), `isPending` (spinner en lugar del icono) y el resto de props del botón (`disabled`, `aria-describedby`, `popoverTarget`). Ayuda visible con el `label` en un tooltip propio que aparece con `:hover` y `:focus-visible` (CSS, sin `title`); va **a la izquierda** del icono porque las tablas tienen scroll propio y una ayuda arriba o abajo se cortaría en la primera o la última fila. Icono y ayuda son `aria-hidden`. |
| Iconos (propuesta) | Editar `Pencil`, Eliminar `Trash2`, Cambiar a Administrador `ShieldCheck`, Cambiar a Usuario `ShieldMinus`, Deshabilitar `UserX`, Habilitar `UserCheck`; paginación `ChevronsLeft`, `ChevronLeft`, `ChevronRight`, `ChevronsRight`; tema `Sun` / `Moon`. Tamaño 16–18 px, `strokeWidth` 1.75, color `ink-muted` que pasa a `ink` en hover; eliminar en `danger`. |
| Uso | `CustomerTable` (Editar, Eliminar), `UserTable` / `UserActions` (Editar —prop `leading`, para que vaya en la misma fila—, Cambiar rol, Habilitar / Deshabilitar, Eliminar) y la sección «Acciones» de `UserDetailPage`. El motivo de una regla de administradores se sigue mostrando como texto bajo los iconos (`aria-describedby`), ajustado a dos líneas (`max-w-44`, `whitespace-normal`). |
| Exportar (`ExportMenu`) | Un `IconButton` «Exportar» (`Download`) con `popoverTarget` hacia un `popover` nativo: el navegador lo pone en la capa superior, lo cierra con Esc o con un clic fuera, devuelve el foco al botón y marca `aria-expanded`, sin effects. Patrón *disclosure* (lista de botones que se recorre con Tab), no `role="menu"`, que exigiría flechas del teclado. Formatos con su nombre: CSV (`FileText`), Excel (`FileSpreadsheet`), PDF (`FileType`), XML (`FileCode`). Posición con CSS anchor positioning: bajo el botón y alineado a su derecha (`position-area: bottom span-left`), con alternativas `flip-inline` / `flip-block` (en móvil el botón queda a la izquierda y el menú se abre hacia la derecha). Al elegir, el menú se cierra y el botón dice «Generando Excel…» con spinner hasta que termina la descarga. |
| Enlaces | «Editar» navega: se usa un `Link` con el mismo aspecto (`iconButtonClassName`) y el mismo tooltip, no un `button`. |

## 3. Tablas compactas

A 1024 px con el sidebar abierto la tabla tiene ~710 px; hoy clientes ocupa ~1.200 px con 8 columnas. Medidas que se combinan:

| Pieza | Cómo |
|---|---|
| Columnas por ancho del contenedor | `DataTable` envuelve la tabla en un contenedor `@container` (Tailwind 4) y cada columna puede declarar desde qué ancho se ve (`minWidth`: `'md' \| 'lg' \| 'xl' \| '2xl'` → clases `hidden @2xl:table-cell`…, en celda y encabezado). Al ser el ancho **del contenedor** (no de la ventana), abrir o colapsar el sidebar reacomoda las columnas sin JavaScript. |
| Prioridades (propuesta, se ajusta midiendo) | Clientes: nombre, email, estado y acciones siempre; ciudad desde `@2xl`; nacimiento y alta desde `@4xl`; teléfono desde `@5xl`. Usuarios: email, rol, estado y acciones siempre; alta desde `@xl`. |
| Fechas solo con el día | `formatDay(localDateTime)` en `lib/format.ts` (toma la parte `yyyy-MM-dd` y la reordena, sin `new Date()`): la columna «Alta» muestra `20-11-2026`. La ficha sigue con `formatDateTime`. |
| Email recortado | Celda con ancho máximo y `truncate`; el texto completo como `title` y en la ficha. |
| Acciones | Iconos de 32 px con espacio de 4 px (de G-02) en vez de enlaces de texto. |
| Celdas | Padding horizontal de 12 a 10 px solo si hace falta tras medir; la altura de fila (44 px) no cambia. |
| Móvil | A 375 px quedan nombre, estado y acciones; si aun así no cabe, el scroll horizontal queda **dentro** de la tabla, nunca en la página. |

Verificación con medidas reales: ancho de la tabla frente al de su contenedor a 1024, 1280 y 1440 px, con el sidebar abierto y colapsado, para clientes (USER y ADMIN, que suma la columna de acciones) y usuarios.

## 4. Paginación por rango

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

## 5. Tema oscuro

### 5.1 Propuesta de paleta (G-05, a aprobar)

Punto de partida, inspirado en el modo oscuro de macOS con un tinte azul y violeta como acento. La tarea G-05 la ajusta con `frontend-design`, comprueba contrastes y la presenta para aprobación:

| Token | Claro (actual) | Oscuro (propuesta) | Uso |
|---|---|---|---|
| `canvas` | `#F2F3F5` | `#1B1F27` | fondo de la app |
| `surface` | `#FFFFFF` | `#242A35` | tablas, paneles, modal |
| `line` / `line-strong` | — | `#343B48` / `#4A5262` | bordes |
| `ink` / `ink-muted` | — | `#E6E9EF` / `#A1A9B8` | texto |
| `primary` (banda del header, botón principal) | `#1F2933` | `#11141A` banda · `#7C6CF2` botón | grafito → casi negro azulado; el botón principal pasa a violeta |
| `accent` / `accent-strong` / `accent-soft` | ámbar | `#8B7CF6` / `#B9AEFF` / `#2E2A4A` | violeta: navegación activa, foco, selección |
| `danger` / `success` / `warning` | — | `#F2867E` / `#6FD3A0` / `#E8B75C` | estados, ajustados para fondo oscuro |

### 5.2 Implementación (G-06)

| Pieza | Cómo |
|---|---|
| Tokens | Los colores siguen en `@theme`; el tema oscuro redefine las mismas variables en `:root[data-theme="dark"]` dentro de `src/index.css`. Los componentes no cambian (RNF-07-03). Se revisan los colores fijos que no son tokens (`text-white`, `bg-white/10`, sombras `rgb(...)`) y se pasan a tokens donde haga falta. `color-scheme: light / dark` para los controles nativos. |
| Preferencia | `uiStore` (ya persistido) suma `theme: 'system' \| 'light' \| 'dark'` (por defecto `'system'`) y `toggleTheme()`, que alterna entre claro y oscuro según el tema que se ve. |
| Aplicar el tema | `src/lib/theme.ts`: `resolveTheme(theme)` (con `matchMedia('(prefers-color-scheme: dark)')`) y `applyTheme()`, que pone `data-theme` en `<html>`. Se conecta a nivel de módulo en `main.tsx` (suscripción al store + listener de `matchMedia` cuando el tema es `'system'`): es sincronizar con el DOM, un sistema externo, sin `useEffect` en componentes. |
| Sin destello | Script en línea en `index.html` (antes del CSS) que lee `localStorage['ui']` y pone `data-theme` antes del primer pintado. |
| Selector | `src/components/layout/ThemeToggle.tsx` en el header (y en la esquina del `AuthLayout`): `IconButton` con `Sun` / `Moon` y `aria-label` «Cambiar a tema oscuro» / «Cambiar a tema claro». |

## 6. Decisiones

| Decisión | Motivo |
|---|---|
| `lazy` del router y no `React.lazy` | Descarga antes de cambiar de pantalla, sin `fallback` intermedio; encaja con `createBrowserRouter`. |
| `lucide-react` | Trazo fino y uniforme, coherente con la tipografía Atkinson y los bordes de 1 px; importa solo lo usado; licencia ISC. Alternativa descartada: SVG propios (más código que mantener). |
| Tooltip propio con CSS | `title` no aparece con teclado ni en táctil y su retardo no se controla. |
| Ventana ±1 en móvil, con CSS | ±3 más cuatro botones no cabe en 375 px; resolverlo con clases evita estado y effects. |
| Violeta solo en el tema oscuro | El ámbar sobre gris azulado oscuro pierde contraste y se ve terroso; el violeta da el acento frío que pide el tema. El claro conserva su identidad. |
| Tema por tokens y `data-theme` | Un solo juego de componentes; el tema es solo datos (RNF-07-03). |
| Exportar: un icono con menú, no un icono por formato | Cuatro iconos de «archivo» se distinguen mal entre sí y ocupan más; el menú muestra el nombre de cada formato. `popover` nativo: cierre con Esc y clic fuera sin effects. |
| Columnas por container queries | El espacio de la tabla depende del sidebar, no solo de la ventana; con `@container` las columnas responden a su espacio real sin `useMediaQuery` ni estado. |
| Solo el día en las tablas | La hora del alta rara vez decide algo en un listado; la ficha la conserva. |

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| Destello del tema al recargar | Script en línea en `index.html` antes del CSS. |
| Colores fijos que no cambian con el tema | Búsqueda de `white`, `black`, `rgb(` y `#` en `src/` durante G-06 y prueba visual de cada pantalla en oscuro. |
| Iconos sin significado claro | Tooltip visible y nombre accesible con el verbo; el motivo de las reglas sigue en texto. |
| Chunk inicial aún grande tras dividir | Separar librerías de proveedor (§1) y medir. |
| Información escondida al ocultar columnas | Solo se ocultan columnas secundarias, siempre visibles en la ficha; al colapsar el sidebar reaparecen. |
| Navegadores sin anchor positioning | El menú `popover` sigue funcionando (capa superior, Esc, clic fuera); solo cambia su posición. Se verifica en el navegador del curso. |

## 8. Trazabilidad

| Requisito | Tareas |
|---|---|
| RF-07-01 | G-01 |
| RF-07-02 | G-02 |
| RF-07-03 | G-02 |
| RF-07-04 | G-04 |
| RF-07-05 | G-05 |
| RF-07-06 | G-06 |
| RF-07-07 | G-07 |
| RF-07-08 | G-02 |
| RF-07-09 | G-03 |
| RNF-07-01 | G-01 |
| RNF-07-02 | G-06 |
| RNF-07-03 | G-06 |
