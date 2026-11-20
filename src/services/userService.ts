import { http } from '../lib/http.ts'
import { toQuery } from '../lib/query.ts'
import { userPageSchema, userSchema, type UserFilters } from '../schemas/user.ts'

// Endpoints de /api/users (solo ADMIN). La escritura se agrega en E-03 y E-04.
export const userService = {
  // Listado paginado: página desde 1 en el frontend, desde 0 en la API. toQuery omite los vacíos.
  page: ({ page, ...filters }: UserFilters) =>
    http.get(`/api/users${toQuery({ ...filters, page: page - 1 })}`, userPageSchema),

  get: (id: number) => http.get(`/api/users/${id}`, userSchema),
}
