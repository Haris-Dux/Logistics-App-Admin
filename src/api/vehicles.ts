import { z } from 'zod'
import { queryOptions } from '@tanstack/react-query'
import { apiClient, apiGet } from './client'
import { type DepotFilter } from './common'

export const vehicleStatusSchema = z.enum(['ACTIVE', 'MAINTENANCE', 'RETIRED'])
export type VehicleStatus = z.infer<typeof vehicleStatusSchema>

export const vehicleSchema = z.object({
  id: z.string(),
  registration: z.string(),
  make: z.string().nullable(),
  model: z.string().nullable(),
  depotId: z.string(),
  status: vehicleStatusSchema,
  /** The route this vehicle is registered to run. */
  routeNumber: z.string().nullable(),
  /** False while a driver has selected the vehicle. */
  available: z.boolean(),
  selectedById: z.string().nullable(),
  selectedAt: z.coerce.date().nullable(),
  selectedByDeviceId: z.string().nullable(),
})
export type Vehicle = z.infer<typeof vehicleSchema>

export const vehiclesQueryOptions = (filters: DepotFilter) =>
  queryOptions({
    queryKey: ['vehicles', filters],
    queryFn: () =>
      apiGet(z.array(vehicleSchema), '/vehicles', {
        ...filters,
        _sort: 'registration',
      }),
  })

export async function updateVehicleStatus(id: string, status: VehicleStatus) {
  await apiClient.patch(`/vehicles/${id}`, { status })
}
