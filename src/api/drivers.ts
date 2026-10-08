import { z } from 'zod'
import { queryOptions } from '@tanstack/react-query'
import { apiClient, apiGet } from './client'
import { type DepotFilter } from './common'

export const driverSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  phone: z.string(),
  depotId: z.string(),
  active: z.boolean(),
  /** Device the driver is signed in on; `null` when not signed in. */
  deviceId: z.string().nullable(),
  lastLoginAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
})
export type Driver = z.infer<typeof driverSchema>

type DriverInput = Pick<Driver, 'name' | 'username' | 'phone' | 'depotId'>

export const driversQueryOptions = (filters: DepotFilter) =>
  queryOptions({
    queryKey: ['drivers', filters],
    queryFn: () =>
      apiGet(z.array(driverSchema), '/drivers', { ...filters, _sort: 'name' }),
  })

export async function createDriver(input: DriverInput & { password: string }) {
  await apiClient.post('/drivers', input)
}

export async function updateDriver(
  id: string,
  patch: Partial<DriverInput & Pick<Driver, 'active'>>
) {
  await apiClient.patch(`/drivers/${id}`, patch)
}

export async function resetDriverPassword(id: string, password: string) {
  await apiClient.patch(`/drivers/${id}`, { password })
}

/** Frees a login bound to a lost phone or an uninstalled app. */
export async function releaseDriverLogin(id: string) {
  await apiClient.patch(`/drivers/${id}`, { deviceId: null })
}
