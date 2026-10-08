import { z } from 'zod'
import { queryOptions } from '@tanstack/react-query'
import { toDateTimeBounds } from '@/lib/dates'
import { adminSchema } from './admins'
import { apiGet } from './client'
import { type DateRange } from './common'

const activitySchema = z.object({
  id: z.string(),
  adminId: z.string(),
  action: z.string(),
  target: z.string(),
  createdAt: z.coerce.date(),
  admin: adminSchema.pick({ name: true }),
})
export type Activity = z.infer<typeof activitySchema>

export const activityLogQueryOptions = (filters: DateRange) =>
  queryOptions({
    queryKey: ['activity-log', filters],
    queryFn: () => {
      const { gte, lte } = toDateTimeBounds(filters)
      return apiGet(z.array(activitySchema), '/activity-log', {
        createdAt_gte: gte,
        createdAt_lte: lte,
        _sort: 'createdAt',
        _order: 'desc',
        _expand: 'admin',
      })
    },
  })
