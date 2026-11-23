# Tareas — Spec 08 (Fase H)

Se ejecutan **una a una** con la skill `sdd-next-task`. Definición de "hecho" en la
[constitución](../constitution.md#6-calidad-definición-de-hecho). Rama: `feature/dashboard`.

- [x] **H-01** Cerrar sesión con icono
  - Depende de: G-07
  - Cubre: RF-08-01, RNF-08-01
  - Archivos: `src/components/layout/UserMenu.tsx`
  - Hecho cuando: el header muestra el icono de salida con nombre accesible y ayuda visible; muestra la carga al cerrar sesión; el cierre de sesión funciona igual
  - Verificación: `npm run build && npm run lint`; en el navegador, cerrar sesión con puntero y con teclado, en claro y oscuro y a 375 px
  - Commit: "Cambia Cerrar sesión por un botón de icono"

- [ ] **H-02** Iconos en las cifras del resumen
  - Depende de: G-07
  - Cubre: RF-08-02, RNF-08-01
  - Archivos: `src/pages/DashboardPage.tsx`
  - Hecho cuando: cada fila del resumen tiene su icono decorativo, en ADMIN y USER, en claro y oscuro
  - Verificación: `npm run build && npm run lint`; en el navegador en ambos temas y a 375 px
  - Commit: "Agrega iconos a las cifras del resumen"

- [ ] **H-03** Exportar la ficha del cliente a PDF
  - Depende de: G-07
  - Cubre: RF-08-03, RNF-08-01, RNF-08-02
  - Archivos: `src/services/customerService.ts`, `src/hooks/useExportCustomers.ts`, `src/pages/CustomerDetailPage.tsx`
  - Hecho cuando: el detalle muestra «Exportar a PDF» a USER y ADMIN; descarga `cliente-{id}.pdf`; muestra la carga y un flash si falla
  - Verificación: `npm run build && npm run lint`; en el navegador, `GET /api/customers/{id}?format=pdf` → 200 `application/pdf` y nombre de archivo `cliente-{id}.pdf`
  - Commit: "Agrega la exportación de la ficha del cliente a PDF"

- [ ] **H-04** Documentar la fase H
  - Depende de: H-01, H-02, H-03
  - Cubre: RF-08-04
  - Archivos: `README.md`, `CLAUDE.md`, `specs/08-iconos-ficha-pdf/spec.md` (estado: Hecha), `specs/README.md` (estado)
  - Hecho cuando: README y CLAUDE.md mencionan el icono de cerrar sesión, los iconos del resumen y la exportación de la ficha a PDF
  - Verificación: `npm run build && npm run lint`; enlaces revisados
  - Commit: "Documenta los iconos de sesión y resumen y la ficha en PDF"
  - Al cerrar: preguntar al usuario si hace merge a `main` y push
