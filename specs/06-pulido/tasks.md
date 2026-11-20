# Tareas — Spec 06 (Fase F)

Se ejecutan **una a una** con la skill `sdd-next-task`. Definición de "hecho" en la
[constitución](../constitution.md#6-calidad-definición-de-hecho).

- [x] **F-01** Página de inicio con resumen
  - Depende de: D-05, E-02
  - Cubre: RF-06-01, RNF-06-01
  - Archivos: `src/hooks/useDashboardStats.ts`, `src/pages/DashboardPage.tsx`, `src/App.tsx` (ruta índice)
  - Hecho cuando: se ven clientes, activos, nuevos del mes y (ADMIN) usuarios, cada uno enlazado al listado filtrado; consultas con `size=1`
  - Verificación: `npm run build && npm run lint`; en el navegador como ADMIN y como USER
  - Commit: "Agrega la página de inicio con el resumen de clientes y usuarios"

- [x] **F-02** Esqueletos, estados vacíos, títulos y foco al navegar
  - Depende de: F-01
  - Cubre: RF-06-02, RF-06-03
  - Archivos: `src/components/ui/TableSkeleton.tsx`, `src/components/ui/EmptyState.tsx`, `src/hooks/useDocumentTitle.ts`, `src/components/ui/PageHeader.tsx`, páginas de clientes y usuarios
  - Hecho cuando: las tablas muestran esqueleto en la primera carga; los vacíos ofrecen una acción; cada página tiene su título; el foco va al `h1` al navegar
  - Verificación: `npm run build && npm run lint`; en el navegador con red lenta (DevTools) y con teclado
  - Commit: "Agrega estados de carga, vacíos, títulos de página y foco al navegar"

- [ ] **F-03** Revisión responsive y auditoría de accesibilidad
  - Depende de: F-02, E-05
  - Cubre: RF-06-04, RF-06-05
  - Archivos: los componentes que la auditoría señale
  - Hecho cuando: sin scroll horizontal de página a 375 px; drawer de filtros funcional; Lighthouse accesibilidad ≥ 90 en login, clientes y usuarios; `prefers-reduced-motion` respetado
  - Verificación: `npm run build && npm run lint`; Lighthouse / axe y recorrido completo como USER y ADMIN en móvil y escritorio
  - Commit: "Mejora el diseño responsive y la accesibilidad del dashboard"

- [ ] **F-04** Limpieza y documentación final
  - Depende de: F-03
  - Cubre: RF-06-06
  - Archivos: `src/pages/DevUiPage.tsx` (eliminar) y su ruta, `README.md`, `CLAUDE.md`, `../3-spring-api/README.md` (enlace al frontend, commit en ese repo), `specs/06-pulido/spec.md` (estado: Hecha), `specs/README.md` (todas las fases en "Hecha")
  - Hecho cuando: no existe `/dev/ui`; la documentación de ambos repos refleja el código real; el SDD está cerrado
  - Verificación: `npm run build && npm run lint`; enlaces de la documentación revisados
  - Commit: "Elimina la página de desarrollo y completa la documentación del frontend" (en `4-react`) y "Enlaza el frontend React desde el README" (en `3-spring-api`)
  - Al cerrar: preguntar al usuario si hace merge a `main` y push en ambos repos
