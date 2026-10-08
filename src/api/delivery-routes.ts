import { z } from 'zod'
import { queryOptions } from '@tanstack/react-query'
import { apiGet } from './client'
import { type DepotFilter } from './common'

const deliveryRouteSchema = z.object({
  id: z.string(),
  routeNumber: z.string(),
  name: z.string(),
  depotId: z.string(),
})

export const deliveryRoutesQueryOptions = (filters: DepotFilter) =>
  queryOptions({
    queryKey: ['routes', filters],
    queryFn: () =>
      apiGet(z.array(deliveryRouteSchema), '/routes', {
        ...filters,
        _sort: 'routeNumber',
      }),
  })
