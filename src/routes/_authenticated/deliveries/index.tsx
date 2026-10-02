import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { deliveryStates, windowResults } from '@/config/statuses'
import { type DeliveryState, type WindowResult } from '@/lib/deliveries'
import {
  dateSearch,
  facetSearch,
  paginationSearch,
  textSearch,
} from '@/lib/search-params'
import { Deliveries } from '@/features/deliveries'

const deliveriesSearchSchema = z.object({
  ...paginationSearch,
  from: dateSearch(),
  to: dateSearch(),
  /** Customer, invoice or order number (searched on the server). */
  q: textSearch(),
  state: facetSearch(Object.keys(deliveryStates) as DeliveryState[]),
  result: facetSearch(Object.keys(windowResults) as WindowResult[]),
  route: z.array(z.string()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/deliveries/')({
  validateSearch: deliveriesSearchSchema,
  component: Deliveries,
})
