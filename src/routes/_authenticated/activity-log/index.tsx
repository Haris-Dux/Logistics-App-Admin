import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { dateSearch, paginationSearch, textSearch } from '@/lib/search-params'
import { ActivityLog } from '@/features/activity-log'

const activityLogSearchSchema = z.object({
  ...paginationSearch,
  from: dateSearch(),
  to: dateSearch(),
  action: textSearch(),
})

export const Route = createFileRoute('/_authenticated/activity-log/')({
  validateSearch: activityLogSearchSchema,
  component: ActivityLog,
})
