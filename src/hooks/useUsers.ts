import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { UserFilters } from '../schemas/user.ts'
import { userService } from '../services/userService.ts'

// Claves del cache de usuarios. Las mutaciones (E-03, E-04) invalidan `all`: se refrescan juntos
// el listado, las fichas y el conteo de administradores.
export const userKeys = {
  all: ['users'] as const,
  list: (filters: UserFilters) => [...userKeys.all, 'list', filters] as const,
  detail: (id: number) => [...userKeys.all, 'detail', id] as const,
  activeAdmins: () => [...userKeys.all, 'active-admins'] as const,
}

export function useUsersPage(filters: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => userService.page(filters),
    placeholderData: keepPreviousData,
  })
}

export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.get(id),
    enabled: Number.isInteger(id) && id > 0,
  })
}

// Filtro de "administradores habilitados" con una sola fila: solo interesa el total.
const ACTIVE_ADMINS: UserFilters = { search: '', role: 'ADMIN', enabled: 'true', page: 1, size: 1, sort: 'id,asc' }

// Cantidad de administradores habilitados, para que la UI anticipe la regla del backend
// "Debe quedar al menos un administrador habilitado". Usa el conteo del servidor
// (page.totalElements) sin traer la lista completa.
export function useActiveAdminCount() {
  return useQuery({
    queryKey: userKeys.activeAdmins(),
    queryFn: () => userService.page(ACTIVE_ADMINS),
    select: (page) => page.page.totalElements,
  })
}
