import { z } from 'zod'
import { queryOptions } from '@tanstack/react-query'
import { apiGet } from './client'

/** A GPS fix as recorded by the driver's phone. */
export const gpsFixSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  /** Metres per second. */
  speed: z.number(),
  /** Degrees clockwise from north. */
  course: z.number(),
  /** Metres. */
  accuracy: z.number(),
  recordedAt: z.coerce.date(),
})
export type GpsFix = z.infer<typeof gpsFixSchema>

export const positionSchema = gpsFixSchema.extend({
  id: z.string(),
  shiftId: z.string(),
  vehicleId: z.string(),
  /** Recorded without signal and uploaded later. */
  late: z.boolean(),
})
export type Position = z.infer<typeof positionSchema>

export const positionsSchema = z.array(positionSchema)

/** The GPS trail of one shift, oldest first. */
export const positionsQueryOptions = (shiftId: string) =>
  queryOptions({
    queryKey: ['positions', shiftId],
    queryFn: () =>
      apiGet(positionsSchema, '/positions', { shiftId, _sort: 'recordedAt' }),
  })
