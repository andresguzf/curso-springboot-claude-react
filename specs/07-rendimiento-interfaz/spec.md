# Spec 07 — Rendimiento e interfaz: bundle por ruta, iconos, tablas compactas, paginación por rango y tema oscuro

| | |
|---|---|
| Fase | G |
| Repo | `4-react` |
| Estado | Hecha |
| Depende de | Spec 06 |
| La necesitan | — |
| Constitución | [`../constitution.md`](../constitution.md) |

## Resumen

Cinco mejoras sobre el dashboard terminado:

1. **Bundle por ruta**: cada página se descarga cuando se visita; el build deja de avisar que el JavaScript supera los 500 kB.
2. **Iconos en las acciones**: editar, eliminar, cambiar rol, habilitar / deshabilitar, exportar y la navegación de la paginación pasan de enlaces o botones de texto a iconos minimalistas, coherentes con la dirección visual.
3. **Tablas compactas**: las tablas de clientes y usuarios caben sin scroll horizontal en escritorio, también con el sidebar de filtros abierto; las fechas de las tablas muestran solo el día.
4. **Paginación por rango**: botones de primera y última página, anterior y siguiente, y una ventana de páginas alrededor de la actual separada con «…».
5. **Tema oscuro**: además del claro, un tema oscuro gris azulado (inspirado en el modo oscuro de macOS) con un acento violeta, que el usuario elige desde el header.

## Historias de usuario

- **HU-07-1** Como usuario quiero que la aplicación cargue rápido al entrar, sin descargar de una vez el código de pantallas que quizá no visite.
- **HU-07-2** Como usuario quiero acciones por fila más limpias, reconocibles de un vistazo y que no ocupen tanto espacio.
- **HU-07-5** Como usuario quiero ver la fila completa de un registro sin desplazar la tabla hacia los lados, aunque tenga abierto el sidebar de filtros.
- **HU-07-3** Como usuario quiero saltar a la primera o la última página y moverme por un rango de páginas cercanas, sin perderme en listados largos.
- **HU-07-4** Como usuario quiero elegir un tema oscuro para trabajar con menos luz, y que la aplicación lo recuerde.

## Criterios de aceptación

**CA-07-1 Bundle por ruta**
- Cuando ejecuto `npm run build`, entonces no aparece la advertencia de chunks mayores a 500 kB.
- Cuando abro el login, entonces no se descarga el código de clientes ni de usuarios; al navegar a una pantalla se descarga su parte.
- Mientras se descarga la parte de una pantalla, veo un indicador de carga discreto y la pantalla anterior no desaparece de golpe.
- Todas las rutas siguen funcionando igual (incluidas las protegidas por sesión y por rol, la 404 y la página de error).

**CA-07-2 Iconos en las acciones**
- En las tablas de clientes y usuarios, y en la ficha de usuario, las acciones (editar, eliminar, cambiar rol, habilitar / deshabilitar) son botones con icono, del mismo tamaño y alineados.
- Cada botón de icono tiene un nombre accesible («Editar a Ana Pérez», «Eliminar a Ana Pérez», «Cambiar a Administrador»…) y muestra ese texto como ayuda al pasar el puntero o al enfocarlo con el teclado.
- Eliminar se distingue en rojo (granate); las acciones deshabilitadas por las reglas de administradores siguen mostrando su motivo visible debajo.
- **Exportar** es un solo botón de icono (descarga) que abre un menú con CSV, Excel, PDF y XML; el menú se cierra con Esc o al hacer clic fuera, y mientras se genera el archivo el botón muestra la carga.
- Las acciones principales de cada página («Nuevo cliente», «Nuevo usuario», «Guardar cambios») siguen siendo botones con texto.

**CA-07-3 Tablas compactas**
- Dado un escritorio de 1024 px o más, cuando abro clientes o usuarios con el sidebar de filtros abierto o colapsado, entonces la tabla cabe sin scroll horizontal.
- Cuando el espacio de la tabla no alcanza, se ocultan primero las columnas secundarias (clientes: teléfono, nacimiento y alta; usuarios: alta); nombre, email, estado y acciones siempre se ven. Al colapsar el sidebar, las columnas vuelven a aparecer si caben.
- Las fechas de las tablas muestran solo el día (`20-11-2026`); la ficha conserva la fecha con hora.
- Un email que no cabe se recorta con «…» y se ve completo en la ficha y como ayuda al pasar el puntero.
- A 375 px se ven al menos nombre, estado y acciones sin scroll horizontal de la página.

**CA-07-4 Paginación por rango**
- La paginación muestra, en este orden: «Primera página», «Página anterior», «…» (si hay páginas ocultas antes), hasta tres páginas antes de la actual, la página actual, hasta tres después, «…» (si hay páginas ocultas después), «Página siguiente» y «Última página».
- Ejemplo con 20 páginas y la actual en 7: Primera · Anterior · … · 4 5 6 **7** 8 9 10 · … · Siguiente · Última.
- Cerca de los extremos la ventana se recorta y el «…» de ese lado desaparece (en la página 2: 1 **2** 3 4 5 · …).
- En la primera página, «Primera» y «Anterior» están deshabilitados; en la última, «Siguiente» y «Última».
- A 375 px la paginación cabe sin desbordar la página (en pantallas chicas la ventana es de una página a cada lado).
- Se mantiene «Mostrando a–b de N» y el selector de tamaño.

**CA-07-5 Tema oscuro**
- En el header hay un botón con icono (sol / luna) para cambiar entre tema claro y oscuro; su nombre accesible dice a qué tema cambia.
- El tema oscuro usa grises azulados (fondo, paneles, bordes) y un acento violeta (navegación activa, foco, selección); el contraste de texto es accesible.
- La primera vez se usa el tema del sistema operativo; después, el que elegí, también al recargar y en el login.
- Al recargar no se ve un destello del tema equivocado antes de cargar la aplicación.
- Los controles nativos (fechas, selects, barras de scroll) se ven en el tema correspondiente.

## Requisitos funcionales

| ID | Requisito |
|---|---|
| RF-07-01 | Carga diferida por ruta: cada página en su propio chunk, indicador de carga durante la navegación y build sin la advertencia de 500 kB. |
| RF-07-02 | Botón de icono reutilizable (`IconButton`) con nombre accesible y ayuda visible al pasar el puntero o enfocar. |
| RF-07-03 | Acciones por fila de clientes y usuarios, y acciones de la ficha de usuario, con iconos. |
| RF-07-04 | Paginación por rango: primera, anterior, ventana de ±3 páginas con «…», siguiente y última; ventana de ±1 en pantallas chicas. |
| RF-07-05 | Propuesta de paleta del tema oscuro (gris azulado + violeta) con la skill `frontend-design`, aprobada por el usuario antes de implementarla. |
| RF-07-06 | Tema oscuro implementado con los mismos tokens del `@theme`, selector en el header, preferencia persistida, tema del sistema por defecto y sin destello al cargar. |
| RF-07-07 | `README.md`, `CLAUDE.md` y `specs/02-base-frontend/design.md` documentan los cambios de la fase. |
| RF-07-08 | Exportar como un botón de icono con menú de formatos (`popover` nativo). |
| RF-07-09 | Tablas sin scroll horizontal en escritorio (con el sidebar abierto o colapsado): columnas con prioridad que se ocultan según el ancho del contenedor (container queries), fechas solo con el día y emails recortados. |

## Requisitos no funcionales

| ID | Requisito |
|---|---|
| RNF-07-01 | El chunk inicial (lo que carga el login) es claramente menor que el bundle único actual (~556 kB); se documentan los tamaños antes y después. |
| RNF-07-02 | Lighthouse (accesibilidad) sigue en 100 en login, clientes y usuarios, en ambos temas. |
| RNF-07-03 | El tema se aplica cambiando solo los valores de los tokens: los componentes no se duplican con clases `dark:` por color. |

## Fuera de alcance

- Más temas o colores elegidos por el usuario (solo claro y oscuro).
- Cambiar la paleta del tema claro.
- Iconos en las acciones principales de página («Nuevo cliente», «Guardar cambios») o en la navegación del header (salvo el selector de tema).
- Cambiar la tabla por tarjetas en móvil (la dirección visual mantiene la tabla).
- Optimizaciones de rendimiento del backend o de las consultas.

## Preguntas abiertas

- Ninguna. Decisiones tomadas en el plan, para revisar: librería de iconos (`lucide-react`), exportar como un icono con menú (no un icono por formato), columnas por ancho del contenedor, ventana de ±1 en móvil y violeta como acento solo del tema oscuro (el claro conserva el ámbar).
