import { z } from 'zod'
import { queryOptions } from '@tanstack/react-query'
import { apiGet } from './client'
import { latLngSchema } from './common'

const depotSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: latLngSchema,
})
export type Depot = z.infer<typeof depotSchema>

export const depotsQueryOptions = () =>
  queryOptions({
    queryKey: ['depots'],
    queryFn: () => apiGet(z.array(depotSchema), '/depots', { _sort: 'name' }),
  })
