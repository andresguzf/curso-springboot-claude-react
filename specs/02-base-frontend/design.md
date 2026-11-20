# Dirección visual — Spec 02 (tarea B-04)

Plan hecho con la skill `frontend-design`. **Estado: aprobada (v2) e implementada en B-04**
(la v1 con lapislázuli se descartó: el usuario pidió cambiar la paleta). Los tokens están en
`@theme` de `src/index.css` y la fuente se importa en `src/main.tsx`. Verificado: Atkinson
Hyperlegible Next trae cifras tabulares (`tnum`), así que no hace falta la alternativa Public Sans.

## 1. Brief

| | |
|---|---|
| Sujeto | Back-office para gestionar la cartera de clientes de una empresa chilena y los usuarios que la administran |
| Audiencia | Personal interno que lo usa a diario: `USER` consulta, busca y exporta; `ADMIN` además crea, edita, elimina y administra usuarios |
| Trabajo principal | Encontrar un grupo de registros rápido (buscar, filtrar, ordenar, paginar) y actuar sobre ellos sin errores |
| Nombre en la interfaz | **Cartera** (en lugar de "4-react", el nombre de la carpeta): corto, dice qué se administra |
| Consecuencia para el diseño | La **tabla es la protagonista**. Mucha densidad de datos (emails, teléfonos `+56 9 …`, fechas, ids) que deben leerse sin confusión; acciones destructivas con confirmación clara |

## 2. Paleta (v2: grafito + acento ámbar)

Una base casi monocroma en grafito y grises fríos, con **un solo acento cálido, ámbar**,
reservado para lo que el usuario tiene "en la mano": foco, selección, filtro activo y la
sección actual. El resultado es sobrio y editorial, y el ámbar se nota justamente porque
aparece poco.

| Token (`@theme`) | Nombre | Hex | Uso |
|---|---|---|---|
| `--color-canvas` | Neblina | `#F2F3F5` | Fondo de la app (gris frío; no crema) |
| `--color-surface` | Papel | `#FFFFFF` | Tablas, paneles, formularios, modal |
| `--color-ink` | Grafito | `#1F2933` | Texto principal |
| `--color-ink-muted` | Piedra | `#5B6470` | Texto secundario, encabezados de tabla, ayudas |
| `--color-line` | Escarcha | `#D9DDE2` | Divisores y bordes de paneles (decorativos) |
| `--color-line-strong` | Pizarra | `#7D8692` | Bordes de inputs y controles (contraste ≥ 3:1) |
| `--color-primary` | Grafito | `#1F2933` | Banda del header y botón principal (texto blanco) |
| `--color-primary-hover` | Grafito claro | `#323F4F` | Hover del botón principal y de la navegación |
| `--color-accent` | Ámbar | `#B7791F` | Anillo de foco, subrayado de la sección actual, borde del filtro activo, marca de orden activo. **Nunca como color de texto** |
| `--color-accent-strong` | Ámbar tostado | `#8F5A0E` | Texto en acento (enlaces "Limpiar filtros", contador de filtros) |
| `--color-accent-soft` | Ámbar claro | `#FBF0DA` | Fondo del filtro activo, fila seleccionada, badge «Administrador» (texto grafito) |
| `--color-danger` | Granate | `#A3262D` | Eliminar, errores, flash de error |
| `--color-success` | Alerce | `#2D6A4F` | Flash de éxito, estado "Activo" / "Habilitado" |
| `--color-warning` | Cobre oscuro | `#8A4B12` | Avisos (p. ej. "se cerrarán sus sesiones"); más rojizo que el acento para no confundirse |

El hover de las filas de la tabla es neutro (`canvas`), no ámbar: el ámbar queda para lo
seleccionado o activo.

Contraste calculado (WCAG):

| Par | Contraste | Uso |
|---|---|---|
| Papel sobre grafito | 14.8:1 | Texto del header y del botón principal |
| Grafito sobre papel / neblina | 14.8 / 13.3:1 | Texto principal |
| Piedra sobre papel / neblina | 6.0 / 5.4:1 | Texto secundario |
| Ámbar tostado sobre papel / ámbar claro | 5.8 / 5.1:1 | Texto en acento |
| Grafito sobre ámbar claro | 13.1:1 | Badge «Administrador», filtro activo |
| Ámbar sobre papel / grafito | 3.6 / 4.1:1 | Solo elementos no textuales (foco, subrayado): cumple 3:1 |
| Pizarra sobre papel | 3.7:1 | Borde de inputs |
| Granate / alerce / cobre sobre papel | 7.3 / 6.4 / 6.8:1 | Estados |

Todo el texto cumple AA (≥ 4.5:1) y los indicadores no textuales ≥ 3:1.

## 3. Tipografía

- **Una sola familia: Atkinson Hyperlegible Next** (variable, `@fontsource-variable/atkinson-hyperlegible-next`, autoalojada; sin CDN). La diseñó el Braille Institute para distinguir caracteres que se confunden (`0`/`O`, `1`/`l`/`I`, `rn`/`m`): justo lo que más pesa en una tabla de emails, teléfonos e ids.
- Cifras tabulares (`tabular-nums`) en ids, fechas, teléfonos y en la paginación, para que las columnas se alineen. Si la fuente no trae la variante `tnum`, se verifica al implementar y se usa Public Sans como alternativa.
- Escala (rem, base 16 px, proporción ~1.2): `h1` 1.75 / 600; `h2` 1.25 / 600; texto 0.9375 (15 px) / 400; tabla 0.875 (14 px) / 400; ayudas 0.8125 (13 px) / 400. Interlineado 1.5 en texto, 1.35 en tablas.
- El `h1` de cada página es la única tipografía grande; no hay eyebrows ni etiquetas en mayúsculas.

## 4. Layout

Concepto: **"el fichero"**. Una banda superior firme (header en grafito, con la sección
actual subrayada en ámbar) y debajo una mesa de trabajo clara: a la izquierda el cajón de
filtros, que se cierra para dejar toda la mesa a la tabla. Contenido alineado a la
izquierda, en `max-w-screen-2xl`.

Listado (escritorio):

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│ Cartera   Resumen   Clientes   Usuarios     ana@…   [Administrador]   Cerrar sesión │  ← banda grafito
│                     ‾‾‾‾‾‾‾‾ (subrayado ámbar)                                      │
├───────────────────────────────────────────────────────────────────────────────────┤
│           ┌───────────────────────────────────────────────┐                        │
│           │ ✓ Cliente «Ana Pérez» creado               ✕ │  ← flash (arriba, ~5 s) │
│           └───────────────────────────────────────────────┘                        │
│ ┌ Filtros (1) ──── ◂ ┐ Clientes                       [Exportar ▾] [Nuevo cliente] │
│ │ Estado             │ [Buscar por nombre, apellido o email…            ]           │
│ │ ▌Activos  (ámbar)  │ ┌───────────────────────────────────────────────────────┐   │
│ │  Inactivos         │ │ Nombre ▲      Email          Ciudad     Alta    …     │   │
│ │ Ciudad [       ]   │ │ Ana Pérez     ana@…          Santiago   23-07   ⋯     │   │
│ │ Nacimiento         │ │ …                                                     │   │
│ │ [desde] [hasta]    │ └───────────────────────────────────────────────────────┘   │
│ │ Alta               │ Mostrando 1–10 de 57          ‹ 1 2 3 ›      10 por página │
│ │ [desde] [hasta]    │                                                              │
│ │ Limpiar filtros    │                                                              │
│ └────────────────────┘                                                              │
└───────────────────────────────────────────────────────────────────────────────────┘
```

Sidebar colapsado: queda una franja de 3 rem con el botón "Filtros (2)" (contador de
filtros activos en ámbar tostado) y la tabla ocupa todo el ancho. En móvil el header
compacta la navegación y los filtros se abren como cajón lateral sobre el contenido.

Modal de confirmación:

```
┌──────────────────────────────────────────┐
│ ¿Eliminar a «Ana Pérez»?                 │
│ Esta acción no se puede deshacer.        │
│                                          │
│                [Cancelar]  [Eliminar]    │  ← Eliminar en granate; foco inicial en Cancelar (anillo ámbar)
└──────────────────────────────────────────┘
```

Login: tarjeta única centrada sobre neblina, con una franja grafito como borde superior de
la tarjeta; sin ilustraciones.

Radios por jerarquía (no uno solo para todo): controles 6 px, paneles y tabla 10 px,
modal 14 px. Sin sombras salvo el modal y el flash (una sombra suave para separarlos del
contenido).

## 5. Principios

1. **La firmeza está en la banda grafito del header; el color, en un solo acento.** Todo lo demás es papel blanco, bordes finos y tinta. El ámbar marca únicamente dónde estás y qué tienes seleccionado o enfocado; rojo y verde solo comunican estado.
2. **La tabla manda**: cabecera fija, filas de 44 px, hover neutro, cifras tabulares, el orden activo visible en el encabezado (marca ámbar). Nada de tarjetas para mostrar registros.
3. **La estructura informa**: badges solo para estado y rol (Activo / Inactivo, Usuario / Administrador), numeración solo en la paginación, divisores solo entre grupos de filtros.
7. **Nombres que entiende quien usa la app**: el rol se muestra como «Usuario» / «Administrador» en minúscula de oración (badges, filtros, formularios); `USER` / `ADMIN` son solo los valores que viajan a la API.
4. **Movimiento mínimo y con causa**: el flash entra con un desvanecimiento corto (150 ms) y el modal aparece sin rebotes; nada se anima al cargar la página. Con `prefers-reduced-motion`, sin animación.
5. **Textos en voz activa, en español y con el mismo verbo de punta a punta**: "Nuevo cliente" → "Guardar" → "Cliente «Ana Pérez» creado"; "Eliminar" → "Cliente eliminado". Errores que dicen qué pasó y cómo seguir; estados vacíos que invitan a actuar ("No hay clientes con estos filtros. Limpiar filtros").
6. **Calidad mínima**: foco visible (anillo ámbar de 2 px con separación blanca, visible sobre papel y sobre grafito), navegación completa con teclado, responsive hasta 375 px, contraste AA.

## 6. Revisión contra los "defaults" (paso de autocrítica)

| Default de diseño generado | ¿Aparece? | Decisión |
|---|---|---|
| Fondo crema + serif de alto contraste + acento terracota | No | Fondo gris frío (neblina, no crema), sans de legibilidad; el ámbar `#B7791F` es amarillo-mostaza, lejos de la terracota/arcilla, y no se usa en fondos grandes |
| Fondo casi negro con un único acento brillante | No | La app es clara; el grafito solo ocupa el header y el botón principal, y el ámbar es apagado (no ácido ni neón) |
| Grises "casi negro" (`#0B0B0B`, `#111`) haciendo de negro | No | El grafito `#1F2933` es un azul-gris oscuro declarado como color propio, no un negro teñido |
| Layout de diario (filetes finos, radio 0, columnas densas) | No | Radios por jerarquía; la densidad está solo en la tabla |
| Kit SaaS: todo en tarjetas iguales, misma sombra, gradientes | No | Registros en tabla; sin gradientes; sombra solo en modal y flash |
| Eyebrows en MAYÚSCULAS, metadatos con "·", monoespaciada para datos, "→" en botones | No | Etiquetas en minúscula de oración; email y rol separados por espacio y badge, no "·"; cifras tabulares en vez de mono; botones sin flechas |
| Número grande + etiqueta chica + gradiente como héroe | No en las páginas de trabajo | El resumen de la spec 06 usará cifras con enlace al listado filtrado, sin gradiente |

Cambios de la v2 respecto de la v1: el primario lapislázuli `#22408F` pasa a grafito
`#1F2933` y el color de identidad se concentra en un acento ámbar. El badge `ADMIN` y el
filtro activo usan ámbar claro con texto grafito; el hover de filas pasa a neutro.

Revisión al cargar la skill `frontend-design` (antes de pedir aprobación): el badge de rol
`ADMIN` en mayúsculas era una etiqueta en mayúsculas (señal de diseño genérico que la skill
pide evitar) y además mostraba un nombre interno del sistema. Se cambió a «Administrador» /
«Usuario» en minúscula de oración.

## 7. Implementación (tras la aprobación)

```css
@import 'tailwindcss';

@theme {
  --font-sans: 'Atkinson Hyperlegible Next Variable', ui-sans-serif, system-ui, sans-serif;

  --color-canvas: #f2f3f5;
  --color-surface: #ffffff;
  --color-ink: #1f2933;
  --color-ink-muted: #5b6470;
  --color-line: #d9dde2;
  --color-line-strong: #7d8692;
  --color-primary: #1f2933;
  --color-primary-hover: #323f4f;
  --color-accent: #b7791f;
  --color-accent-strong: #8f5a0e;
  --color-accent-soft: #fbf0da;
  --color-danger: #a3262d;
  --color-success: #2d6a4f;
  --color-warning: #8a4b12;

  --radius-control: 6px;
  --radius-panel: 10px;
  --radius-dialog: 14px;
}
```

Clases resultantes: `bg-canvas`, `bg-surface`, `text-ink`, `text-ink-muted`, `border-line`,
`border-line-strong`, `bg-primary`, `hover:bg-primary-hover`, `outline-accent`,
`text-accent-strong`, `bg-accent-soft`, `text-danger`, `rounded-control`, `rounded-panel`,
`rounded-dialog`. La fuente se importa una vez en `src/main.tsx`
(`import '@fontsource-variable/atkinson-hyperlegible-next'`).
