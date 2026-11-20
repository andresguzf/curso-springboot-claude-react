import { ROLE_LABELS, type Role } from '../../schemas/user.ts'
import { Badge } from '../ui/Badge.tsx'

// Rol en la interfaz: «Administrador» en ámbar claro, «Usuario» neutro (USER / ADMIN solo viajan a la API).
export function RoleBadge({ role }: { role: Role }) {
  return <Badge tone={role === 'ADMIN' ? 'accent' : 'neutral'}>{ROLE_LABELS[role]}</Badge>
}
