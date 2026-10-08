import { z } from 'zod'
import { queryOptions } from '@tanstack/react-query'
import { toDateTimeBounds } from '@/lib/dates'
import { apiGet } from './client'
import { type DateRange, type DepotFilter } from './common'
import { driverSchema } from './drivers'
import { vehicleSchema } from './vehicles'

export const alertTypeSchema = z.enum([
  'running_late',
  'delivery_skipped',
  'no_gps',
  'defect_reported',
  'upload_failed',
])
export type AlertType = z.infer<typeof alertTypeSchema>

const alertSchema = z.object({
  id: z.string(),
  type: alertTypeSchema,
  depotId: z.string(),
  vehicleId: z.string().nullable(),
  driverId: z.string().nullable(),
  deliveryId: z.string().nullable(),
  vehicleCheckId: z.string().nullable(),
  message: z.string(),
  createdAt: z.coerce.date(),
  vehicle: vehicleSchema.pick({ registration: true }).optional(),
  driver: driverSchema.pick({ name: true }).optional(),
})
export type Alert = z.infer<typeof alertSchema>

export const alertsQueryOptions = (filters: DateRange & DepotFilter) =>
  queryOptions({
    queryKey: ['alerts', filters],
    queryFn: () => {
      const { gte, lte } = toDateTimeBounds(filters)
      return apiGet(z.array(alertSchema), '/alerts', {
        createdAt_gte: gte,
        createdAt_lte: lte,
        depotId: filters.depotId,
        _sort: 'createdAt',
        _order: 'desc',
        _expand: ['vehicle', 'driver'],
      })
    },
  })
