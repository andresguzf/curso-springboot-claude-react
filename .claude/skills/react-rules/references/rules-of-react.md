# Reglas de React y uso correcto de `useEffect`

Basado en la documentación oficial:
[Reglas de React](https://es.react.dev/reference/rules) y
[Quizás no necesites un Efecto](https://es.react.dev/learn/you-might-not-need-an-effect).
Lee esta guía cuando vayas a escribir un `useEffect`, cuando revises código que
ya los usa o cuando dudes sobre dónde poner una lógica.

## Contenido

1. Las tres reglas de React
2. ¿Necesito un effect? (árbol de decisión)
3. Antipatrones de effect y su reemplazo
4. Cuándo sí usar un effect y cómo escribirlo
5. Inmutabilidad: recetas de copia

---

## 1. Las tres reglas de React

### 1.1 Componentes y hooks deben ser puros

- **Idempotentes**: con las mismas props, estado y contexto devuelven el mismo JSX.
  `new Date()`, `Math.random()` o leer `window` durante el render rompen esto;
  calcúlalos en un handler, en un effect, o una sola vez fuera del componente.
- **Sin side effects en el render**: nada de `fetch`, `localStorage.setItem`,
  suscripciones, `document.title = ...` ni `navigate()` en el cuerpo del componente.
  Van en handlers (si los causa el usuario) o en effects (si los causa mostrar el componente).
  `StrictMode` renderiza dos veces en desarrollo justamente para destapar esto.
- **Props y estado son inmutables**: nunca `props.items.push(x)` ni `state.user.name = 'x'`.
  Crea un valor nuevo y pásalo al setter.
- **Los valores que devuelve un hook y sus argumentos son inmutables**: no
  modifiques el objeto que devuelve `useQuery`, el array de un store, etc.
- **Un valor pasado a JSX ya no se modifica**: haz las mutaciones locales
  (p. ej. armar un array con `push` dentro del render) **antes** del `return`.
  Mutar una variable local recién creada en el mismo render sí está permitido.

### 1.2 React llama a componentes y hooks

- Usa los componentes en JSX (`<Card />`), nunca como función (`Card()`): React
  necesita controlar cuándo se renderizan y asociarles su estado.
- No pases hooks como valores ni los crees dinámicamente (`const useX = cond ? useA : useB`).

### 1.3 Reglas de los hooks

- Llámalos **solo en el nivel superior** del componente o de otro hook: nunca
  dentro de `if`, bucles, callbacks, `try/catch` ni después de un `return` anticipado.
  React identifica cada hook por su orden de llamada.
- Llámalos **solo desde componentes o custom hooks** (funciones que empiezan con
  `use`), no desde funciones JavaScript normales ni handlers.
- Si necesitas algo condicional, la condición va **dentro** del hook o en su
  configuración: `useQuery({ queryKey, queryFn, enabled: id !== undefined })`.

El linter del proyecto (`oxlint` con `react/rules-of-hooks` y
`react/exhaustive-deps`) detecta las violaciones; corre `npm run lint`.

## 2. ¿Necesito un effect?

```
¿El código responde a una acción del usuario (click, submit, escribir)?
  └─ Sí → va en el event handler.
¿Es un valor que se puede calcular a partir de props/estado?
  └─ Sí → calcúlalo en el render (useMemo si es costoso).
¿Es traer datos de una API?
  └─ Sí → React Query (useQuery), no useEffect + fetch + useState.
¿Hay que reiniciar estado cuando cambia una prop?
  └─ Sí → key en el padre, o derivar del valor.
¿Hay que sincronizar con algo fuera de React (DOM, timers, WebSocket,
 librería no React, APIs del navegador) porque el componente se mostró?
  └─ Sí → ahora sí: useEffect (o useSyncExternalStore para suscripciones).
```

## 3. Antipatrones y su reemplazo

### Estado derivado sincronizado con un effect

```tsx
// ❌ Render extra con un valor obsoleto, y dos fuentes de verdad
const [fullName, setFullName] = useState('')
useEffect(() => {
  setFullName(`${firstName} ${lastName}`)
}, [firstName, lastName])

// ✅ Calcúlalo en el render
const fullName = `${firstName} ${lastName}`
```

### Filtrar/ordenar listas

```tsx
// ❌
const [visible, setVisible] = useState<Todo[]>([])
useEffect(() => setVisible(todos.filter((t) => !t.done)), [todos])

// ✅ (useMemo solo si es costoso)
const visible = useMemo(() => todos.filter((t) => !t.done), [todos])
```

### Lógica de un evento en un effect

```tsx
// ❌ Se dispara también al recargar o al montar con el flag ya en true
useEffect(() => {
  if (submitted) {
    toast('Guardado')
    navigate('/products')
  }
}, [submitted])

// ✅ En el handler (o en onSuccess de la mutación)
function handleSubmit(values: ProductFormValues) {
  createProduct.mutate(values, {
    onSuccess: () => {
      toast('Guardado')
      navigate('/products')
    },
  })
}
```

### Avisar al padre con un effect

```tsx
// ❌ El padre se entera un render tarde y puede encadenar renders
useEffect(() => {
  onChange(isOn)
}, [isOn, onChange])

// ✅ Actualiza el estado local y avisa al padre en el mismo handler
function handleClick() {
  const next = !isOn
  setIsOn(next)
  onChange(next)
}
```

Mejor aún: si el padre necesita el valor, que el padre sea el dueño del estado
y el hijo sea controlado (`isOn` + `onChange` por props).

### Reiniciar estado al cambiar una prop

```tsx
// ❌
useEffect(() => {
  setComment('')
}, [userId])

// ✅ En el padre
<Profile key={userId} userId={userId} />
```

### Ajustar parte del estado cuando cambia una prop

```tsx
// ❌ Guardar el seleccionado y "corregirlo" con un effect
// ✅ Guardar el id y derivar el objeto
const [selectedId, setSelectedId] = useState<number | null>(null)
const selected = items.find((item) => item.id === selectedId) ?? null
```

### Cadenas de effects

Si un effect cambia estado solo para disparar otro effect, junta toda la lógica
en el handler que inicia la cadena y calcula el siguiente estado de una vez.

### Fetch de datos con effect

```tsx
// ❌ Sin cache, sin dedupe, condiciones de carrera, estados a mano
useEffect(() => {
  fetch(`/api/products/${id}`).then((r) => r.json()).then(setProduct)
}, [id])

// ✅
const { data: product, isPending, error } = useProduct(id)
```

### Inicializar la app una sola vez

```tsx
// ✅ Fuera de los componentes (corre una vez al cargar el módulo)
if (typeof window !== 'undefined') {
  checkAuthToken()
}
```

## 4. Cuándo sí usar un effect y cómo escribirlo

Usos legítimos: suscribirse a eventos del navegador (`resize`, `keydown`
global), conectar un WebSocket o `EventSource`, integrar una librería no React
(mapa, gráfico, editor), manejar foco/scroll/medidas del DOM, timers, sincronizar
`document.title`.

Reglas para que sean simples y correctos:

- **Un effect = una sincronización.** Si hace dos cosas independientes, son dos effects.
- **Siempre limpia** lo que creas: `removeEventListener`, `clearInterval`,
  `socket.close()`, `controller.abort()`. En desarrollo React monta → desmonta → monta
  para comprobar que la limpieza funciona.
- **Dependencias honestas**: incluye todo valor reactivo que uses. No silencies
  `exhaustive-deps`; si una dependencia sobra, saca el valor del componente,
  muévelo dentro del effect o usa un updater (`setCount((c) => c + 1)`).
- **Evita objetos/funciones creados en el render como dependencia**: crea el
  objeto dentro del effect o depende de sus primitivos.

```tsx
useEffect(() => {
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') onClose()
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [onClose])
```

```tsx
useEffect(() => {
  document.title = `${count} productos | Mi App`
}, [count])
```

Si el effect se repite en varios componentes, extráelo a un custom hook
(`useDocumentTitle(title)`, `useEscapeKey(onClose)`).

## 5. Inmutabilidad: recetas de copia

| Operación | ❌ Muta | ✅ Copia |
|---|---|---|
| Agregar | `arr.push(x)` | `[...arr, x]` |
| Insertar al inicio | `arr.unshift(x)` | `[x, ...arr]` |
| Quitar | `arr.splice(i, 1)` | `arr.filter((x) => x.id !== id)` |
| Reemplazar | `arr[i] = x` | `arr.map((y) => (y.id === x.id ? x : y))` |
| Ordenar | `arr.sort()` | `arr.toSorted()` / `[...arr].sort()` |
| Invertir | `arr.reverse()` | `arr.toReversed()` |
| Campo de objeto | `obj.name = 'x'` | `{ ...obj, name: 'x' }` |
| Campo anidado | `obj.address.city = 'x'` | `{ ...obj, address: { ...obj.address, city: 'x' } }` |

Cuando el siguiente estado depende del anterior, usa la forma updater:
`setItems((prev) => [...prev, item])`.
