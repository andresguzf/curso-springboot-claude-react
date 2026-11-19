---
name: react-rules
description: Genera proyectos React con TypeScript (React 19.3.1+, Vite, Tailwind CSS, React Router) con estructura por capas pages / components / hooks / stores / schemas / services, y aplica las buenas prácticas y las Reglas de React al escribir código; Zustand para estado global, Zod para validar datos, React Hook Form + Zod en formularios y TanStack Query para datos de una API, con layout semántico header / nav / main / footer. Úsala siempre que el usuario pida crear una aplicación, proyecto o componente React, o agregar o modificar componentes, páginas, hooks, custom hooks, estado (useState, Zustand, store), formularios, validaciones, llamadas a una API, useEffect o lógica de UI en React o TSX, aunque no mencione esta skill ni diga "buenas prácticas".
---

# React rules

Esta skill define cómo crear un proyecto React desde cero y cómo escribir o
modificar su código para que todos los proyectos del curso tengan la misma
estructura, las mismas librerías en su última versión y respeten las
[Reglas de React](https://es.react.dev/reference/rules). Se usa en dos situaciones:

1. **Proyecto nuevo**: el workspace no tiene `package.json` → genera el proyecto (paso 1) y luego el código.
2. **Proyecto existente**: ya hay `package.json` → salta al paso 2 y respeta lo que ya existe.

## 1. Generar el proyecto

Usa el script incluido; no armes el `package.json` a mano. Parte de la plantilla
oficial de Vite (`react-ts`), le superpone la plantilla de la skill
(`assets/template/`), instala todas las dependencias en su última versión,
comprueba que React sea ≥ 19.3.1 y verifica con `npm run build`. Nunca
sobrescribe archivos que ya existan en el workspace (`CLAUDE.md`, `.claude/`...).

```bash
bash .claude/skills/react-rules/scripts/create_project.sh .
```

Si trabajas desde otro directorio, usa la ruta absoluta del directorio de esta
skill. El script necesita Node.js (react-router 8 pide Node ≥ 22.22; con una
versión anterior instala igual pero muestra un aviso `EBADENGINE`).

| Pieza | Elección | Motivo |
|---|---|---|
| Lenguaje | TypeScript (strict, activo por defecto en TS 7) | Tipado, seguridad y mantenibilidad; nunca `.js`/`.jsx` |
| Build | Vite + `@vitejs/plugin-react` | Plantilla oficial, arranque instantáneo |
| UI | React ≥ 19.3.1 + `react-dom` | Versión actual; el script consulta npm |
| Estilos | Tailwind CSS 4 (`@tailwindcss/vite`, `@import 'tailwindcss'`) | Sin `tailwind.config.js` ni PostCSS |
| Rutas | `react-router` (`createBrowserRouter`) | El layout usa `<Outlet />` y `<NavLink />` |
| Datos de API | `@tanstack/react-query` (+ devtools) | Cache compartido, refetch y estados de carga |
| Estado global | `zustand` | Store mínimo con `create()` |
| Validación | `zod` 4 | Esquemas que además generan los tipos |
| Formularios | `react-hook-form` + `@hookform/resolvers` | Integración directa con Zod |
| Lint | `oxlint` con `rules-of-hooks` y `exhaustive-deps` | Viene en la plantilla de Vite |

Si el script no puede usarse, reproduce sus pasos a mano: `npx create-vite@latest`
con `--template react-ts`, copia `assets/template/` encima, instala las mismas
dependencias con `@latest` y corre `npm run build`.

## 2. Estructura

```
src/
├── main.tsx              # StrictMode + QueryClientProvider + devtools
├── App.tsx               # router (createBrowserRouter) con Layout como ruta raíz
├── index.css             # @import 'tailwindcss'
├── components/
│   ├── layout/           # Layout, Header, Navbar, Footer
│   ├── ui/               # piezas genéricas reutilizables (Button, FormField, Card...)
│   └── {recurso}/        # componentes de un recurso (ProductForm, ProductList...)
├── pages/                # una página por ruta; orquesta hooks y componentes
├── hooks/                # custom hooks: de datos (useProducts) y de UI (useToggle)
├── stores/               # stores de Zustand (estado global de cliente)
├── schemas/              # esquemas Zod + tipos con z.infer
├── services/             # funciones que llaman a la API (sin React)
└── lib/                  # http.ts, queryClient.ts y utilidades puras
```

Imports relativos con extensión (`'./Layout.tsx'`), como genera Vite. Exports
con nombre para componentes y hooks (`export function ProductCard`); solo `App`
usa `export default`. Un componente por archivo, nombre en PascalCase igual al
archivo; hooks en camelCase empezando por `use`.

## 3. Dónde vive cada dato

Elegir bien el lugar del estado evita la mayoría de los `useEffect` innecesarios:

| El dato es... | Va en | No en |
|---|---|---|
| Calculable desde props/estado | una variable en el render (`useMemo` si es costoso) | otro `useState` + effect |
| Propio de un componente (input, abierto/cerrado) | `useState` local | Zustand |
| Compartido por componentes lejanos y es del cliente (sesión, carrito, tema) | store de Zustand | Context con muchos valores, prop drilling profundo |
| Traído de una API | React Query (`useQuery` / `useMutation`) | Zustand, `useEffect` + `fetch` |
| Estado de un formulario | React Hook Form + esquema Zod | un `useState` por campo |
| Parte de la URL (id, filtros compartibles) | `useParams` / `useSearchParams` | estado duplicado |

SWR solo si el proyecto ya lo usa; no mezcles dos librerías de cache.

## 4. Reglas al escribir código

Cada regla tiene detrás un motivo concreto; entenderlo ayuda a aplicarla en
casos que no aparecen aquí.

**Componentes**
- Pequeños, simples y con una sola responsabilidad: si un componente trae datos,
  maneja un formulario y dibuja una tabla, sepáralo. Las páginas orquestan; los
  componentes de `components/` reciben props y emiten callbacks.
- Props tipadas con un `type` (`type ProductCardProps = {...}`), sin `any`.
  Los tipos de datos salen de los esquemas Zod con `z.infer`.
- Para comunicar cambios al padre, recibe un callback por props (`onChange`,
  `onSubmit`, `onDelete`) y llámalo desde el handler del hijo cuando ocurre el
  cambio, no desde un effect que observa el estado.

**Pureza e inmutabilidad** (React puede renderizar varias veces; un render con
efectos o mutaciones produce bugs intermitentes)
- Sin side effects en el render: nada de `fetch`, `localStorage`, `navigate()`,
  `new Date()` o `Math.random()` en el cuerpo del componente.
- Nunca mutes props, estado ni valores de hooks: crea copias (`[...arr, x]`,
  `arr.map`, `arr.filter`, `{ ...obj, campo }`, `toSorted()`). Usa la forma
  updater (`setX((prev) => ...)`) cuando el nuevo valor depende del anterior.

**Hooks**
- Solo en el nivel superior del componente o de un custom hook: nunca dentro de
  `if`, bucles, callbacks ni después de un `return` anticipado. Para condicionar,
  usa opciones como `enabled` de React Query.
- Extrae lógica reutilizable a custom hooks (`useAuth`, `useProducts`,
  `useToggle`) para que los componentes se lean como una descripción de la UI.
  Lógica sin estado compartida entre handlers → una función normal en `lib/`.

**Effects**
- `useEffect` solo para sincronizar con sistemas externos (DOM, timers,
  WebSocket, APIs del navegador, librerías no React). Para suscripciones,
  prefiere `useSyncExternalStore`.
- La lógica que causa el usuario va en el event handler, no en un effect.
- Nada de effects para lógica derivada de props o estado: calcula en el render.
- Para reiniciar estado usa `key` en el padre; para ajustarlo, deriva el valor o
  actualízalo en el evento que lo provoca.
- Effects simples: una sincronización por effect, con limpieza y dependencias
  completas (no silencies `exhaustive-deps`).

**Rendimiento**
- `useMemo` para cálculos realmente costosos (filtrar/ordenar listas grandes,
  transformaciones pesadas), no para cada valor. `key` estables con el id del
  dato, nunca el índice si la lista cambia.

Guía completa con ejemplos ❌/✅ de cada antipatrón de `useEffect` y la tabla de
copias inmutables en `references/rules-of-react.md`. Léela antes de escribir
o revisar un `useEffect`.

## 5. Librerías: cómo usarlas

Plantillas verificadas de cada pieza en `references/patterns.md` (esquema Zod,
servicio, hooks de React Query, store de Zustand, formulario, lista con
`useMemo`, página, custom hooks, `key`, rutas, cookies + CSRF). Léelo antes de
crear un recurso nuevo o de tocar cualquiera de estas capas. Lo esencial:

- **Zod**: `z.object({ name: z.string().min(3, 'mensaje') })`, mensajes en
  español, tipos con `z.infer`. `parse` cuando un dato inválido es un bug
  (respuestas de la API, ya lo hace `lib/http.ts`); `safeParse` cuando decides
  qué hacer con el error (localStorage, query params). En Zod 4: `z.email()`,
  no `z.string().email()`.
- **React Hook Form**: `useForm<FormValues>({ resolver: zodResolver(schema), defaultValues })`,
  `register`, `handleSubmit(onSubmit)` y `formState.errors`. Números con
  `register('price', { valueAsNumber: true })` + `z.number()`.
- **Zustand**: `create<State>()((set) => ({ ...estado, ...acciones }))`; las
  acciones usan `set((state) => nuevoObjeto)`. Lee con selectores
  (`useStore((s) => s.items)`), nunca el store completo.
- **TanStack Query**: un hook por operación en `hooks/`
  (`useQuery({ queryKey, queryFn })`, `useMutation` con `invalidateQueries` en
  `onSuccess`), claves centralizadas, `isPending` para la carga inicial.

## 6. Interfaz y layout

- Tailwind CSS para todos los estilos (sin archivos `.css` por componente, sin
  `style={{}}` salvo valores dinámicos).
- El layout reutilizable ya viene en `components/layout/`: `<header>` con el
  nombre de la app y `<nav>` (Navbar con `NavLink`), `<main>` centrado
  (`mx-auto max-w-5xl px-4`) donde se renderiza cada página con `<Outlet />`, y
  `<footer>` siempre abajo (`min-h-screen flex flex-col` + `flex-1` en `main`).
- HTML semántico dentro de las páginas: `section`, `article`, `h1` único por
  página, `ul/li` para listas, `button` para acciones y `Link` para navegar,
  `label` asociado a cada input.
- Página nueva: componente en `pages/`, ruta en `App.tsx` y, si va en el menú,
  entrada en `NAV_ITEMS` de `Navbar.tsx`.

## 7. Modificar un proyecto existente

- Respeta la estructura y las librerías que ya están. Si falta alguna del stack
  y el cambio la necesita (p. ej. el primer formulario y no hay
  `react-hook-form`), instálala con `npm install paquete@latest`.
- Al agregar un recurso que viene de una API, crea el conjunto: esquema en
  `schemas/`, servicio en `services/`, hooks en `hooks/`, componentes en
  `components/{recurso}/` y página + ruta.
- Al tocar código existente que viola estas reglas en la zona que modificas
  (effect para estado derivado, mutación de estado), corrígelo y menciónalo en
  el resumen; no reescribas archivos que no tienen que ver con el pedido.

## 8. Verificar

Antes de dar por terminado un cambio:

```bash
npm run build   # tsc -b (tipos) + build de Vite
npm run lint    # oxlint: reglas de hooks y dependencias de effects
```

Ambos deben pasar sin errores. Para levantar la app: `npm run dev`
(http://localhost:5173). Al terminar, resume al usuario la versión de React
instalada y los archivos creados o modificados.
