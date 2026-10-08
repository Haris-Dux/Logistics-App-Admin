import { z } from 'zod'
import { queryOptions } from '@tanstack/react-query'
import { apiGet } from './client'
import { type DateRange, type DepotFilter, dateSchema } from './common'
import { driverSchema } from './drivers'
import { gpsFixSchema } from './positions'
import { tripSchema } from './trips'
import { vehicleSchema } from './vehicles'

export const shiftStatusSchema = z.enum([
  'checks',
  'driving',
  'at_stop',
  'idle',
  'offline',
  'ended',
])
export type ShiftStatus = z.infer<typeof shiftStatusSchema>

/** A driver working a route in a vehicle on one day. */
const shiftSchema = z.object({
  id: z.string(),
  date: dateSchema,
  depotId: z.string(),
  routeNumber: z.string(),
  driverId: z.string(),
  vehicleId: z.string(),
  status: shiftStatusSchema,
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date().nullable(),
  lastPosition: gpsFixSchema.nullable(),
  driver: driverSchema.pick({ id: true, name: true, phone: true }),
  vehicle: vehicleSchema.pick({ id: true, registration: true }),
  trips: z.array(tripSchema),
})
export type Shift = z.infer<typeof shiftSchema>

type ShiftFilters = DateRange & DepotFilter

export const getShifts = ({ from, to, depotId }: ShiftFilters) =>
  apiGet(z.array(shiftSchema), '/shifts', {
    date_gte: from,
    date_lte: to,
    depotId,
    _sort: 'date,routeNumber',
    _expand: ['driver', 'vehicle'],
    _embed: 'trips',
  })

export const shiftsQueryOptions = (filters: ShiftFilters) =>
  queryOptions({
    queryKey: ['shifts', filters],
    queryFn: () => getShifts(filters),
  })
