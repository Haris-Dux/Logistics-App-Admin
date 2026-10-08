import { z } from 'zod'
import { queryOptions } from '@tanstack/react-query'
import { apiGet } from './client'
import {
  type DateRange,
  type DepotFilter,
  containerCountsSchema,
  dateSchema,
  latLngSchema,
  timeOfDaySchema,
} from './common'

const deliveryStatusSchema = z.enum(['pending', 'completed', 'skipped'])

const invoiceSchema = z.object({
  invoiceNumber: z.string(),
  orderNumber: z.string(),
  customerReference: z.string(),
  quantity: z.number(),
  quantityCigs: z.number(),
  quantityWAndS: z.number(),
  /** Pence. */
  value: z.number(),
})

const proofOfDeliverySchema = z.object({
  customerSignature: z.string(),
  customerName: z.string(),
  customerPosition: z.string(),
  customerSignedAt: z.coerce.date(),
  driverSignature: z.string(),
  driverName: z.string(),
  driverSignedAt: z.coerce.date(),
  /** Where the driver was when the delivery was marked done. */
  location: latLngSchema,
})

/** One stop on a trip: the manifest line plus what happened there. */
const deliverySchema = z.object({
  id: z.string(),
  tripId: z.string(),
  shiftId: z.string().nullable(),
  depotId: z.string(),
  routeNumber: z.string(),
  dispatchDate: dateSchema,
  tripNumber: z.number(),
  sequence: z.number(),
  customerId: z.string(),
  customerName: z.string(),
  deliveryAddress: z.string(),
  invoiceAddress: z.string(),
  postcode: z.string(),
  area: z.string(),
  weight: z.number(),
  deliveryMethod: z.enum(['drop_and_drive', 'handball']),
  /** Planned arrival. */
  arrival: timeOfDaySchema,
  /** Planned departure. */
  departure: timeOfDaySchema,
  timeWindow: z.tuple([timeOfDaySchema, timeOfDaySchema]),
  outstanding: containerCountsSchema,
  invoices: z.array(invoiceSchema),
  location: latLngSchema,
  status: deliveryStatusSchema,
  eta: z.coerce.date().nullable(),
  actualArrival: z.coerce.date().nullable(),
  actualDeparture: z.coerce.date().nullable(),
  completedAt: z.coerce.date().nullable(),
  skipReason: z.string().nullable(),
  acceptedInFull: z.boolean().nullable(),
  itemsNotInDelivery: z.string().nullable(),
  notes: z.string().nullable(),
  containers: z
    .object({
      delivered: containerCountsSchema,
      collected: containerCountsSchema,
    })
    .nullable(),
  pod: proofOfDeliverySchema.nullable(),
})
export type Delivery = z.infer<typeof deliverySchema>

type DeliveryFilters = DateRange & DepotFilter & { q?: string }

export const getDeliveries = ({ from, to, depotId, q }: DeliveryFilters) =>
  apiGet(z.array(deliverySchema), '/deliveries', {
    dispatchDate_gte: from,
    dispatchDate_lte: to,
    depotId,
    q: q || undefined,
    _sort: 'dispatchDate,routeNumber,tripNumber,sequence',
  })

export const deliveriesQueryOptions = (filters: DeliveryFilters) =>
  queryOptions({
    queryKey: ['deliveries', filters],
    queryFn: () => getDeliveries(filters),
  })

export const deliveryQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['deliveries', id],
    queryFn: () => apiGet(deliverySchema, `/deliveries/${id}`),
  })
