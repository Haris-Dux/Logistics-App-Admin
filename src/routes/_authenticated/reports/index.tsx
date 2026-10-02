import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { dateSearch } from '@/lib/search-params'
import { Reports } from '@/features/reports'

const reportsSearchSchema = z.object({
  from: dateSearch(),
  to: dateSearch(),
  view: z.enum(['driver', 'vehicle']).optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/reports/')({
  validateSearch: reportsSearchSchema,
  component: Reports,
})
