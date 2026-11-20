import { http } from '../lib/http.ts'
import { toQuery } from '../lib/query.ts'
import { userPageSchema, userSchema, type UserFilters, type UserFormValues } from '../schemas/user.ts'

// Endpoints de /api/users (solo ADMIN). La eliminación se agrega en E-04.
export const userService = {
  // Listado paginado: página desde 1 en el frontend, desde 0 en la API. toQuery omite los vacíos.
  page: ({ page, ...filters }: UserFilters) =>
    http.get(`/api/users${toQuery({ ...filters, page: page - 1 })}`, userPageSchema),

  get: (id: number) => http.get(`/api/users/${id}`, userSchema),

  create: (values: UserFormValues) => http.post('/api/users', values, userSchema),

  // PUT completo (no hay PATCH): email, rol y estado siempre; la contraseña solo si se escribió
  // una nueva (sin ella, el backend conserva la actual).
  update: (id: number, { password, ...values }: UserFormValues) =>
    http.put(`/api/users/${id}`, password === '' ? values : { ...values, password }, userSchema),
}
