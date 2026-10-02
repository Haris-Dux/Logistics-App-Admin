import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { dateSearch } from '@/lib/search-params'
import { LiveMap } from '@/features/live-map'

const liveMapSearchSchema = z.object({
  /** Selected vehicle id. */
  vehicle: z.string().optional().catch(undefined),
  /** Day to show; today when omitted. */
  date: dateSearch(),
})

export const Route = createFileRoute('/_authenticated/live-map/')({
  validateSearch: liveMapSearchSchema,
  component: LiveMap,
})
