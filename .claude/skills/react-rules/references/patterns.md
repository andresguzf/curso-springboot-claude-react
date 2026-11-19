# Patrones de código (React 19 + TypeScript)

Plantillas verificadas (compilan con `tsc -b` y pasan `oxlint`) para un recurso
de ejemplo `Product`. Cambia los nombres al recurso real; mantén la forma.

## Contenido

1. Esquema Zod + tipos derivados (`src/schemas/`)
2. Servicio de API (`src/services/`)
3. Hooks de React Query (`src/hooks/`)
4. Store de Zustand (`src/stores/`)
5. Formulario con React Hook Form + Zod
6. Componente de UI reutilizable
7. Lista con estado derivado y `useMemo`
8. Página que orquesta (callbacks hacia el padre)
9. Custom hooks que no son de datos
10. Reiniciar estado con `key`
11. Rutas nuevas y navbar
12. Backend con cookies + CSRF (p. ej. Spring Security) y proxy de Vite
13. SWR (solo si el proyecto ya lo usa)

---

## 1. Esquema Zod + tipos derivados

`src/schemas/product.ts`. Los tipos salen del esquema con `z.infer`, así el tipo
y la validación nunca se desincronizan. Separa el esquema de la respuesta de la
API del esquema del formulario: suelen tener campos distintos (`id`, fechas).

```ts
import { z } from 'zod'

// Esquema de lo que devuelve la API.
export const productSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
})

export const productListSchema = z.array(productSchema)

// Esquema del formulario: reglas de validación y mensajes en español.
export const productFormSchema = z.object({
  name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().trim().max(200, 'Máximo 200 caracteres'),
  price: z.number({ error: 'Ingresa un número' }).positive('El precio debe ser mayor a 0'),
})

export type Product = z.infer<typeof productSchema>
export type ProductFormValues = z.infer<typeof productFormSchema>
```

Notas de Zod 4:
- Email, URL, UUID son top-level: `z.email()`, `z.url()`, `z.uuid()` (no `z.string().email()`, que está deprecado).
- Mensaje personalizado: segundo argumento string (`.min(3, '...')`) o `{ error: '...' }`.
- `parse` lanza `ZodError`; `safeParse` devuelve `{ success, data | error }`. Usa
  `parse` cuando un dato inválido es un bug (respuesta de la API, en `lib/http.ts`)
  y `safeParse` cuando quieres decidir qué hacer (leer `localStorage`, query params):

```ts
const result = productSchema.safeParse(JSON.parse(raw))
if (!result.success) {
  console.warn(z.prettifyError(result.error))
  return null
}
return result.data
```

## 2. Servicio de API

`src/services/productService.ts`. Solo funciones que hablan HTTP; sin React.
`http` (en `src/lib/http.ts`) valida cada respuesta con el esquema que recibe.

```ts
import { http } from '../lib/http.ts'
import {
  productListSchema,
  productSchema,
  type Product,
  type ProductFormValues,
} from '../schemas/product.ts'

const BASE = '/api/products'

export const productService = {
  list: () => http.get(BASE, productListSchema),
  get: (id: number) => http.get(`${BASE}/${id}`, productSchema),
  create: (values: ProductFormValues) => http.post(BASE, values, productSchema),
  update: (id: number, values: ProductFormValues) =>
    http.put(`${BASE}/${id}`, values, productSchema),
  remove: (id: Product['id']) => http.delete(`${BASE}/${id}`),
}
```

## 3. Hooks de React Query

`src/hooks/useProducts.ts`. Los componentes nunca llaman a `fetch` ni al servicio
directamente: usan estos hooks, que comparten cache entre todos los componentes.
Tras una mutación, invalida las queries afectadas en vez de editar el cache a mano.

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProductFormValues } from '../schemas/product.ts'
import { productService } from '../services/productService.ts'

// Claves centralizadas: evitan typos y permiten invalidar con precisión.
export const productKeys = {
  all: ['products'] as const,
  detail: (id: number) => ['products', id] as const,
}

export function useProducts() {
  return useQuery({ queryKey: productKeys.all, queryFn: productService.list })
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.get(id),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: ProductFormValues) => productService.create(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: productService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}
```

En TanStack Query v5 el estado de carga inicial es `isPending` (no `isLoading`) y
las opciones van siempre en un objeto (`useQuery({ queryKey, queryFn })`).

## 4. Store de Zustand

`src/stores/cartStore.ts`. Solo estado **de cliente** compartido (carrito, sesión,
preferencias de UI). Los datos del servidor no se copian al store: viven en
React Query. Estado y acciones juntos en `create()`; cada acción devuelve copias.

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '../schemas/product.ts'

type CartItem = { product: Product; quantity: number }

type CartState = {
  items: CartItem[]
  add: (product: Product) => void
  remove: (productId: number) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      // Siempre se devuelve un array nuevo: nunca push/splice sobre el estado.
      add: (product) =>
        set((state) => {
          const exists = state.items.some((item) => item.product.id === product.id)
          return {
            items: exists
              ? state.items.map((item) =>
                  item.product.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item,
                )
              : [...state.items, { product, quantity: 1 }],
          }
        }),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: 'cart' }, // clave en localStorage; quita persist si no hace falta
  ),
)

// Selectores: cada componente se suscribe solo a lo que usa.
export const selectCartCount = (state: CartState) =>
  state.items.reduce((total, item) => total + item.quantity, 0)
```

Uso:

```tsx
const count = useCartStore(selectCartCount)        // valor derivado
const add = useCartStore((state) => state.add)     // una acción
```

- `create<State>()(...)` con doble paréntesis: es la forma tipada en Zustand 5.
- Evita `const store = useCartStore()` (sin selector): el componente se
  re-renderiza con cualquier cambio del store.
- Si un selector devuelve un objeto o array nuevo, envuélvelo en `useShallow`
  (`import { useShallow } from 'zustand/react/shallow'`) para no provocar
  renders infinitos: `useCartStore(useShallow((s) => ({ add: s.add, clear: s.clear })))`.
- Nunca hagas `state.items.push(...)` dentro de `set`: Zustand compara por
  referencia y el cambio no se vería.

## 5. Formulario con React Hook Form + Zod

`src/components/products/ProductForm.tsx`. El esquema define la validación y el
tipo; el formulario no sabe de la API: entrega los valores válidos al padre con
`onSubmit`.

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { productFormSchema, type ProductFormValues } from '../../schemas/product.ts'
import { FormField } from '../ui/FormField.tsx'

type ProductFormProps = {
  defaultValues?: ProductFormValues
  isSubmitting?: boolean
  onSubmit: (values: ProductFormValues) => void // el padre decide qué hacer con los datos
}

const EMPTY: ProductFormValues = { name: '', description: '', price: 0 }

export function ProductForm({ defaultValues = EMPTY, isSubmitting = false, onSubmit }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Nombre" error={errors.name?.message}>
        <input {...register('name')} className="w-full rounded-md border border-slate-300 px-3 py-2" />
      </FormField>
      <FormField label="Descripción" error={errors.description?.message}>
        <textarea {...register('description')} className="w-full rounded-md border border-slate-300 px-3 py-2" />
      </FormField>
      <FormField label="Precio" error={errors.price?.message}>
        <input
          type="number"
          step="0.01"
          {...register('price', { valueAsNumber: true })}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </FormField>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isSubmitting ? 'Guardando…' : 'Guardar'}
      </button>
    </form>
  )
}
```

- Campos numéricos: `register('price', { valueAsNumber: true })` + `z.number()`.
  No uses `z.coerce.number()` con `useForm<T>`: el tipo de entrada pasa a
  `unknown` y el genérico deja de cuadrar.
- Errores del servidor (p. ej. email duplicado → 409): en el `onError` de la
  mutación usa `setError('email', { message })` del formulario, o muestra el
  mensaje sobre el formulario.
- Para editar, pasa los datos como `defaultValues` y monta el formulario con
  `key={product.id}` (ver sección 10) en vez de llamar a `reset` en un effect.

## 6. Componente de UI reutilizable

`src/components/ui/FormField.tsx`. Pequeño, tipado, sin lógica de negocio.

```tsx
import type { ReactNode } from 'react'

type FormFieldProps = {
  label: string
  error?: string
  children: ReactNode
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <span role="alert" className="block text-sm text-red-600">{error}</span>}
    </label>
  )
}
```

## 7. Lista con estado derivado y `useMemo`

`src/components/products/ProductList.tsx`. El filtro se **calcula** en el render
a partir de props y estado; no hay un segundo estado `filteredProducts` ni un
effect que lo sincronice. `useMemo` solo porque filtrar una lista grande en
cada pulsación puede costar; para cálculos triviales no hace falta.

```tsx
import { useMemo, useState } from 'react'
import type { Product } from '../../schemas/product.ts'

type ProductListProps = {
  products: Product[]
  onDelete: (id: number) => void
}

export function ProductList({ products, onDelete }: ProductListProps) {
  const [query, setQuery] = useState('')

  const normalized = query.trim().toLowerCase()
  const visible = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(normalized)),
    [products, normalized],
  )

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar…"
        className="w-full rounded-md border border-slate-300 px-3 py-2"
      />
      <ul className="divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
        {visible.map((product) => (
          <li key={product.id} className="flex items-center justify-between px-4 py-3">
            <span>{product.name}</span>
            <button type="button" onClick={() => onDelete(product.id)} className="text-sm text-red-600">
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

`key` siempre con un id estable del dato, nunca con el índice del array si la
lista se puede reordenar, filtrar o borrar.

## 8. Página que orquesta

`src/pages/ProductsPage.tsx`. La página conecta datos (hooks) con componentes
presentacionales y les pasa callbacks. Los hijos avisan al padre llamando a esos
callbacks desde sus handlers.

```tsx
import { ProductForm } from '../components/products/ProductForm.tsx'
import { ProductList } from '../components/products/ProductList.tsx'
import { useCreateProduct, useDeleteProduct, useProducts } from '../hooks/useProducts.ts'
import { selectCartCount, useCartStore } from '../stores/cartStore.ts'

export function ProductsPage() {
  const { data: products = [], isPending, error } = useProducts()
  const createProduct = useCreateProduct()
  const deleteProduct = useDeleteProduct()
  const cartCount = useCartStore(selectCartCount)

  if (isPending) return <p>Cargando…</p>
  if (error) return <p role="alert" className="text-red-600">{error.message}</p>

  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-bold">Productos ({cartCount} en el carrito)</h1>
      <ProductForm
        isSubmitting={createProduct.isPending}
        onSubmit={(values) => createProduct.mutate(values)}
      />
      <ProductList products={products} onDelete={(id) => deleteProduct.mutate(id)} />
    </section>
  )
}
```

Observa que todos los hooks se llaman **antes** de los `return` anticipados.

## 9. Custom hooks que no son de datos

Extrae a un hook cuando la misma combinación de estado + handlers aparece en
más de un componente, o cuando un componente se vuelve difícil de leer. El
nombre empieza con `use` y el hook puede llamar a otros hooks.

```ts
// src/hooks/useToggle.ts
import { useCallback, useState } from 'react'

export function useToggle(initial = false) {
  const [isOn, setIsOn] = useState(initial)
  const toggle = useCallback(() => setIsOn((value) => !value), [])
  return [isOn, toggle] as const
}
```

```ts
// src/hooks/useMediaQuery.ts — sincroniza con un sistema externo (el navegador)
import { useSyncExternalStore } from 'react'

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}
```

Para suscribirte a una fuente externa (APIs del navegador, librerías con
`subscribe`) prefiere `useSyncExternalStore` a `useEffect` + `useState`.

Lógica compartida entre handlers que no necesita estado: una función normal
(`src/lib/format.ts`), no un hook.

```ts
// src/lib/format.ts
const currency = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
export const formatPrice = (value: number) => currency.format(value)
```

Un `useAuth` típico combina store y queries:

```ts
// src/hooks/useAuth.ts
import { useAuthStore } from '../stores/authStore.ts'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  return { user, isAuthenticated: user !== null, logout }
}
```

## 10. Reiniciar estado con `key`

Cuando un componente debe empezar de cero al cambiar una entidad (otro
producto, otro usuario), cambia su `key` en el padre. React lo desmonta y monta
de nuevo con estado limpio, sin effects:

```tsx
<ProductForm key={product.id} defaultValues={toFormValues(product)} onSubmit={handleSave} />
```

Si solo una parte del estado depende de una prop, calcula ese valor en el render
o actualízalo en el handler que provoca el cambio, en vez de "observar" la prop
con un effect.

## 11. Rutas nuevas y navbar

Una página nueva = un componente en `src/pages/`, una entrada en `children` del
router (`src/App.tsx`) y, si debe aparecer en el menú, una entrada en
`NAV_ITEMS` (`src/components/layout/Navbar.tsx`).

```tsx
children: [
  { index: true, element: <HomePage /> },
  { path: 'products', element: <ProductsPage /> },
  { path: 'products/:id', element: <ProductDetailPage /> },
  { path: '*', element: <NotFoundPage /> },
],
```

Lee parámetros con `useParams()` y valídalos: `const id = Number(useParams().id)`.
Navega tras una acción con `const navigate = useNavigate()` dentro del handler
o del `onSuccess` de la mutación, nunca durante el render.

## 12. Backend con cookies + CSRF y proxy de Vite

Si la API usa cookies `HttpOnly` y CSRF con cookie `XSRF-TOKEN` (patrón por
defecto de Spring Security con `CookieCsrfTokenRepository`):

1. Proxy en desarrollo, para que front y API compartan origen (cookies
   `SameSite=Strict` y sin CORS). En `vite.config.ts`:

   ```ts
   export default defineConfig({
     plugins: [react(), tailwindcss()],
     server: { proxy: { '/api': 'http://localhost:8080' } },
   })
   ```

   y deja `VITE_API_URL` vacía.

2. En `src/lib/http.ts`, agrega `credentials: 'include'` al `fetch` y, en
   métodos que modifican (`POST`, `PUT`, `PATCH`, `DELETE`), la cabecera
   `X-XSRF-TOKEN` con el valor de la cookie:

   ```ts
   function readCookie(name: string): string | undefined {
     return document.cookie
       .split('; ')
       .find((row) => row.startsWith(`${name}=`))
       ?.split('=')[1]
   }

   const xsrf = readCookie('XSRF-TOKEN')
   if (xsrf && init.method && init.method !== 'GET') headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrf))
   ```

3. El estado de sesión del cliente (usuario actual) va en un store de Zustand
   **sin** el token: el token vive en la cookie `HttpOnly` y JavaScript no debe
   leerlo ni guardarlo en `localStorage`.

## 13. SWR (solo si el proyecto ya lo usa)

La opción por defecto es TanStack Query. Si el proyecto existente ya usa SWR,
sigue con SWR para no mezclar dos caches:

```ts
import useSWR from 'swr'
import { productService } from '../services/productService.ts'

export function useProducts() {
  return useSWR('/api/products', productService.list)
}
// tras una mutación: mutate('/api/products') desde useSWRConfig()
```
