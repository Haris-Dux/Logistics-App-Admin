import { z } from 'zod'
import { dateSchema, timeOfDaySchema } from './common'

const tripStatusSchema = z.enum([
  'PLANNED',
  'DOWNLOADED',
  'STARTED',
  'COMPLETED',
  'UPLOADED',
  'CANCELLED',
])
/** One trip a route runs on a dispatch date. */
export const tripSchema = z.object({
  id: z.string(),
  shiftId: z.string().nullable(),
  routeNumber: z.string(),
  depotId: z.string(),
  dispatchDate: dateSchema,
  tripNumber: z.number(),
  predictedMiles: z.number(),
  actualMiles: z.number().nullable(),
  plannedStart: timeOfDaySchema,
  plannedEnd: timeOfDaySchema,
  startedAt: z.coerce.date().nullable(),
  endedAt: z.coerce.date().nullable(),
  status: tripStatusSchema,
})
export type Trip = z.infer<typeof tripSchema>
