import { z } from 'zod'
import { queryOptions } from '@tanstack/react-query'
import { apiClient, apiGet } from './client'
import { type DepotFilter, dateSchema } from './common'
import { driverSchema } from './drivers'
import { vehicleSchema } from './vehicles'

export const checkTypeSchema = z.enum([
  'tyre_pressure',
  'fuel_level',
  'lights_indicators',
  'mirrors_glass',
  'brakes',
  'fluid_levels',
  'bodywork_doors',
])
export type CheckType = z.infer<typeof checkTypeSchema>

const defectStatusSchema = z.enum(['none', 'open', 'repaired'])

const checkItemSchema = z.object({
  type: checkTypeSchema,
  passed: z.boolean(),
  notes: z.string().nullable(),
  photos: z.array(z.string()),
})

const repairSchema = z.object({
  repairedAt: z.coerce.date(),
  notes: z.string(),
  recordedBy: z.string(),
})
type Repair = z.infer<typeof repairSchema>

const vehicleCheckSchema = z.object({
  id: z.string(),
  date: dateSchema,
  depotId: z.string(),
  shiftId: z.string(),
  vehicleId: z.string(),
  driverId: z.string(),
  checkedAt: z.coerce.date(),
  items: z.array(checkItemSchema),
  defectStatus: defectStatusSchema,
  repair: repairSchema.nullable(),
  vehicle: vehicleSchema.pick({ registration: true, status: true }),
  driver: driverSchema.pick({ name: true }),
})
export type VehicleCheck = z.infer<typeof vehicleCheckSchema>

export const vehicleChecksQueryOptions = (
  filters: { date: string } & DepotFilter
) =>
  queryOptions({
    queryKey: ['vehicle-checks', filters],
    queryFn: () =>
      apiGet(z.array(vehicleCheckSchema), '/vehicle-checks', {
        ...filters,
        _sort: 'checkedAt',
        _expand: ['vehicle', 'driver'],
      }),
  })

export async function recordRepair(checkId: string, repair: Repair) {
  await apiClient.patch(`/vehicle-checks/${checkId}`, {
    defectStatus: 'repaired',
    repair,
  })
}
