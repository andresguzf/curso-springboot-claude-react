import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ROLE_LABELS, type Role, type User, type UserFilters, type UserFormValues } from '../schemas/user.ts'
import { refreshSession } from '../lib/http.ts'
import { authService } from '../services/authService.ts'
import { userService } from '../services/userService.ts'
import { useAuthStore } from '../stores/authStore.ts'
import { flash } from '../stores/flashStore.ts'

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

// Alta y edición: flash e invalidación en onSuccess (también refresca el conteo de admins);
// la navegación la decide la página en el onSuccess de mutate.
export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: UserFormValues) => userService.create(values),
    onSuccess: async (user) => {
      flash.success(`Usuario «${user.email}» creado`)
      await queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useUpdateUser(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: UserFormValues) => userService.update(id, values),
    onSuccess: async (user, values) => {
      const me = useAuthStore.getState().user
      const isMe = user.id === me?.id

      // La propia contraseña: el backend revocó todas mis sesiones (refresh tokens). Se cierra la
      // sesión aquí (logout borra las cookies, el access token seguiría vivo hasta 15 min).
      if (isMe && values.password !== '') {
        await authService.logout().catch(() => undefined)
        queryClient.clear()
        useAuthStore.getState().clear({ loggedOut: true })
        flash.info('Contraseña cambiada, inicia sesión de nuevo')
        return
      }

      // El propio email: el JWT trae el email anterior y el backend ya no lo encuentra. Se renueva la
      // sesión ANTES de refrescar datos (con refreshSession, la promesa compartida: nunca dos
      // /refresh en paralelo) y onRefreshed actualiza el usuario del header.
      if (isMe && user.email !== me.email) {
        const renewed = await refreshSession()
        if (!renewed) return // onSessionExpired ya llevó al login con su aviso
      }

      flash.success(`Usuario «${user.email}» actualizado`)
      await queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export type UserChange = { role: Role } | { enabled: boolean }

function changeMessage(change: UserChange): string {
  if ('role' in change) return `Rol cambiado a ${ROLE_LABELS[change.role]}`
  return change.enabled ? 'Usuario habilitado' : 'Usuario deshabilitado'
}

// Acción rápida desde la fila o la ficha: PUT completo { email, role, enabled } con un solo
// campo cambiado (sin contraseña: el backend conserva la actual). Tras un error también se
// invalida: un 409 suele significar que otro admin cambió algo y la tabla debe actualizarse.
export function useChangeUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ user, change }: { user: User; change: UserChange }) =>
      userService.update(user.id, { email: user.email, role: user.role, enabled: user.enabled, password: '', ...change }),
    onSuccess: (_, { change }) => flash.success(changeMessage(change)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (user: User) => userService.remove(user.id),
    onSuccess: (_, user) => {
      flash.success('Usuario eliminado')
      queryClient.removeQueries({ queryKey: userKeys.detail(user.id) })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}
