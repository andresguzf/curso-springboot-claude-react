# Tareas — Spec 07 (Fase G)

Se ejecutan **una a una** con la skill `sdd-next-task`. Definición de "hecho" en la
[constitución](../constitution.md#6-calidad-definición-de-hecho). Rama: `feature/dashboard`.

- [ ] **G-01** Carga diferida por ruta e indicador de navegación
  - Depende de: F-04
  - Cubre: RF-07-01, RNF-07-01
  - Archivos: `src/App.tsx`, `src/components/layout/{AppLayout,AuthLayout}.tsx` (indicador), `src/components/layout/NavigationProgress.tsx`, `vite.config.ts` (solo si hace falta separar librerías), `specs/07-rendimiento-interfaz/plan.md` (tabla de tamaños)
  - Hecho cuando: cada página es un chunk propio; el build no muestra la advertencia de 500 kB; el login no descarga el código de clientes ni de usuarios; al navegar se ve el indicador; todas las rutas (protegidas, por rol, 404, error) funcionan
  - Verificación: `npm run build && npm run lint`; en el navegador, pestaña de red al abrir el login y al navegar a clientes y usuarios (como ADMIN y como USER)
  - Commit: "Divide el bundle por ruta con carga diferida de las páginas"

- [ ] **G-02** Botones de icono en las acciones
  - Depende de: G-01
  - Cubre: RF-07-02, RF-07-03
  - Archivos: `package.json` (`lucide-react`), `specs/constitution.md` (§1, stack), `src/components/ui/IconButton.tsx`, `src/components/customers/CustomerTable.tsx`, `src/components/users/{UserTable,UserActions}.tsx`, `src/pages/UserDetailPage.tsx`
  - Hecho cuando: editar, eliminar, cambiar rol y habilitar / deshabilitar son iconos alineados del mismo tamaño, con nombre accesible y tooltip visible con puntero y teclado; eliminar en granate; el motivo de las reglas de admin sigue visible; las acciones principales conservan su texto
  - Verificación: `npm run build && npm run lint`; en el navegador con teclado (Tab muestra el tooltip) y a 375 px; Lighthouse accesibilidad 100 en clientes y usuarios
  - Commit: "Cambia las acciones por fila a botones con iconos"

- [ ] **G-03** Paginación por rango
  - Depende de: G-02
  - Cubre: RF-07-04
  - Archivos: `src/lib/pagination.ts` (`pageWindow`), `src/components/ui/Pagination.tsx`
  - Hecho cuando: primera, anterior, ventana de ±3 con «…», siguiente y última según los ejemplos del plan; extremos deshabilitados; ventana de ±1 en pantallas chicas sin desborde a 375 px
  - Verificación: `npm run build && npm run lint`; los casos de la tabla del plan llamando a `pageWindow` desde la consola; en el navegador con más de 7 páginas (tamaño 10 y datos de prueba que se borran al terminar)
  - Commit: "Agrega paginación por rango con primera y última página"

- [ ] **G-04** Propuesta de paleta del tema oscuro
  - Depende de: G-02
  - Cubre: RF-07-05
  - Archivos: `specs/02-base-frontend/design.md` (sección «Tema oscuro»), `specs/07-rendimiento-interfaz/plan.md` (§4.1 con la paleta final)
  - Hecho cuando: la propuesta (tokens, contrastes medidos, ejemplos de header, tabla, modal y flash) está escrita con la skill `frontend-design` y **el usuario la aprueba**; sin código de la aplicación
  - Verificación: contrastes de texto ≥ 4,5:1 (≥ 3:1 en texto grande e iconos) calculados para cada combinación; vista previa en un artifact o captura para revisarla
  - Commit: "Define la paleta del tema oscuro"

- [ ] **G-05** Tema oscuro y selector de tema
  - Depende de: G-04
  - Cubre: RF-07-06, RNF-07-02, RNF-07-03
  - Archivos: `src/index.css`, `index.html` (script sin destello), `src/stores/uiStore.ts` (`theme`, `toggleTheme`), `src/lib/theme.ts`, `src/main.tsx`, `src/components/layout/{ThemeToggle,Header,AuthLayout}.tsx`, componentes con colores fijos que haga falta pasar a tokens
  - Hecho cuando: el botón del header alterna claro / oscuro; la primera visita usa el tema del sistema; la elección se recuerda al recargar y en el login; no hay destello al recargar; controles nativos en el tema correcto; todas las pantallas se ven bien en oscuro
  - Verificación: `npm run build && npm run lint`; recorrido de todas las pantallas en ambos temas (escritorio y 375 px); emulación de `prefers-color-scheme`; Lighthouse accesibilidad 100 en login, clientes y usuarios en oscuro
  - Commit: "Agrega el tema oscuro con selector en el header"

- [ ] **G-06** Documentar la fase G
  - Depende de: G-01, G-03, G-05
  - Cubre: RF-07-07
  - Archivos: `README.md`, `CLAUDE.md`, `specs/07-rendimiento-interfaz/spec.md` (estado: Hecha), `specs/README.md` (estado)
  - Hecho cuando: README y CLAUDE.md describen la carga por ruta, `IconButton`, la paginación por rango y el tema (tokens, `data-theme`, `uiStore.theme`)
  - Verificación: `npm run build && npm run lint`; enlaces revisados
  - Commit: "Documenta la carga por ruta, los iconos, la paginación por rango y el tema oscuro"
  - Al cerrar: preguntar al usuario si hace merge a `main` y push
