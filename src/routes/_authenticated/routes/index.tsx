import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { dateSearch } from '@/lib/search-params'
import { DeliveryRoutes } from '@/features/delivery-routes'

const routesSearchSchema = z.object({
  /** Day to show; today when omitted. */
  date: dateSearch(),
})

export const Route = createFileRoute('/_authenticated/routes/')({
  validateSearch: routesSearchSchema,
  component: DeliveryRoutes,
})
