# Spec 08 — Iconos en la sesión y el resumen, y ficha de cliente en PDF

| | |
|---|---|
| Fase | H |
| Repo | `4-react` |
| Estado | En curso |
| Depende de | Spec 07 |
| La necesitan | — |
| Constitución | [`../constitution.md`](../constitution.md) |

## Resumen

Tres ajustes pequeños sobre el dashboard terminado:

1. **Cerrar sesión con icono**: el botón de texto «Cerrar sesión» del header pasa a ser un botón de icono, como el del tema.
2. **Iconos en el resumen**: cada cifra del resumen (`DashboardPage`) lleva, además del texto, un icono que la identifica.
3. **Exportar la ficha de un cliente a PDF**: el detalle del cliente agrega un botón para descargar su ficha en PDF (solo PDF).

## Historias de usuario

- **HU-08-1** Como usuario quiero reconocer de un vistazo cómo salir de la aplicación, sin que el texto ocupe espacio en el header.
- **HU-08-2** Como usuario quiero distinguir rápido cada cifra del resumen por su icono.
- **HU-08-3** Como usuario quiero descargar la ficha de un cliente en PDF desde su detalle, para compartirla o imprimirla.

## Criterios de aceptación

**CA-08-1 Cerrar sesión con icono**
- En el header, a la derecha del rol, veo un botón de icono de salida (`LogOut`) en lugar del texto «Cerrar sesión».
- El botón tiene el nombre accesible «Cerrar sesión» y muestra esa ayuda al pasar el puntero o al enfocarlo con el teclado.
- Mientras se cierra la sesión, el botón muestra la carga y no se puede volver a pulsar.
- Al cerrar sesión el comportamiento no cambia (vuelvo al login sin ruta de origen, spec 03).

**CA-08-2 Iconos en el resumen**
- Cada fila del resumen muestra a la izquierda un icono en un recuadro con el acento suave: clientes en la cartera (`Users`), clientes activos (`UserCheck`), dados de alta en el mes (`UserPlus`) y usuarios con acceso (`ShieldUser`, solo ADMIN).
- Los iconos son decorativos (`aria-hidden`): el nombre de cada enlace sigue siendo su texto.
- Se ven bien en tema claro y oscuro, con contraste de icono ≥ 3:1.

**CA-08-3 Ficha de cliente en PDF**
- Dado el detalle de un cliente, cuando pulso «Exportar a PDF» (botón de icono junto a «Volver a clientes»), entonces se descarga `cliente-{id}.pdf` con su ficha.
- Lo ven USER y ADMIN (como la exportación del listado).
- Mientras se genera, el botón muestra la carga; si falla, aparece un flash de error.
- La descarga pasa por `http.download` (renueva la sesión si el access token venció), nunca por un enlace directo a la API.

## Requisitos funcionales

| ID | Requisito |
|---|---|
| RF-08-01 | Cerrar sesión como `IconButton` (`LogOut`, tono `band`) con nombre accesible, ayuda visible y estado de carga. |
| RF-08-02 | Icono decorativo por fila en el resumen (`StatRow` recibe `icon`). |
| RF-08-03 | Exportar la ficha de un cliente a PDF desde su detalle (`customerService.exportPdf`, `useExportCustomerPdf`). |
| RF-08-04 | `README.md` y `CLAUDE.md` documentan los cambios de la fase. |

## Requisitos no funcionales

- **RNF-08-01** Accesibilidad: nombres accesibles en los botones de icono, iconos decorativos ocultos a lectores de pantalla y contraste medido en ambos temas.
- **RNF-08-02** Sin cambios en el backend: el endpoint de la ficha en PDF ya existe.

## Fuera de alcance

- Exportar la ficha en otros formatos (CSV, Excel, XML): solo PDF, por decisión del usuario.
- Ficha de usuario en PDF: el backend no la ofrece.
- Iconos en el menú de navegación.

## Preguntas abiertas

- El segundo punto del pedido («Descerrar sesión») se interpretó como parte del primero (icono de cerrar sesión). Si se refería a otra cosa, se agrega como requisito nuevo.
