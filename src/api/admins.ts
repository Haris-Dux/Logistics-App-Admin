import { z } from 'zod'
import { queryOptions } from '@tanstack/react-query'
import { apiClient, apiGet } from './client'

export const adminSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  username: z.string(),
  /** `null` = head office (sees every depot). */
  depotId: z.string().nullable(),
  active: z.boolean(),
  lastLoginAt: z.coerce.date().nullable(),
})
export type Admin = z.infer<typeof adminSchema>

type AdminInput = Pick<Admin, 'name' | 'email' | 'username' | 'depotId'>

export const adminsQueryOptions = () =>
  queryOptions({
    queryKey: ['admins'],
    queryFn: () => apiGet(z.array(adminSchema), '/admins', { _sort: 'name' }),
  })

export async function createAdmin(input: AdminInput & { password: string }) {
  await apiClient.post('/admins', input)
}

export async function updateAdmin(
  id: string,
  patch: Partial<AdminInput & Pick<Admin, 'active'>>
) {
  await apiClient.patch(`/admins/${id}`, patch)
}
