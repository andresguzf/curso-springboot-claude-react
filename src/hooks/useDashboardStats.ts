import { useQueries } from '@tanstack/react-query'
import { useState } from 'react'
import { customerFiltersSchema, type CustomerFilters } from '../schemas/customer.ts'
import { userFiltersSchema, type UserFilters } from '../schemas/user.ts'
import { customerService } from '../services/customerService.ts'
import { userService } from '../services/userService.ts'
import { customerKeys } from './useCustomers.ts'
import { userKeys } from './useUsers.ts'

// Primer día del mes en curso (yyyy-MM-dd, hora local) y el nombre del mes ("noviembre").
function currentMonth() {
  const now = new Date()
  const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const name = new Intl.DateTimeFormat('es-CL', { month: 'long' }).format(now)
  return { start, name }
}

// Una sola fila por consulta: solo interesa page.totalElements (RNF-06-01).
const ONE_ROW = { size: 1 }
const customersWith = (filters: Partial<CustomerFilters>): CustomerFilters => ({
  ...customerFiltersSchema.parse({}),
  ...filters,
  ...ONE_ROW,
})
const ALL_USERS: UserFilters = { ...userFiltersSchema.parse({}), ...ONE_ROW }

// Totales del resumen. Reutiliza las claves de clientes y usuarios: las mutaciones ya invalidan
// `customerKeys.all` / `userKeys.all`, así que el resumen se actualiza solo. Usuarios solo para ADMIN.
export function useDashboardStats({ includeUsers }: { includeUsers: boolean }) {
  // El mes se fija al montar (inicializador de useState): la clave de la consulta queda estable.
  const [month] = useState(currentMonth)

  const filters = {
    customers: customersWith({}),
    active: customersWith({ active: 'true' }),
    newThisMonth: customersWith({ createdFrom: month.start }),
  }

  const [customers, active, newThisMonth, users] = useQueries({
    queries: [
      ...Object.values(filters).map((f) => ({
        queryKey: customerKeys.list(f),
        queryFn: () => customerService.page(f),
        select: (page: { page: { totalElements: number } }) => page.page.totalElements,
      })),
      {
        queryKey: userKeys.list(ALL_USERS),
        queryFn: () => userService.page(ALL_USERS),
        select: (page: { page: { totalElements: number } }) => page.page.totalElements,
        enabled: includeUsers,
      },
    ],
  })

  return { month, customers, active, newThisMonth, users }
}
