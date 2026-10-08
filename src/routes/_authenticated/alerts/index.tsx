import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { alertTypes } from '@/config/statuses'
import { type AlertType } from '@/api/alerts'
import {
  dateSearch,
  facetSearch,
  paginationSearch,
  textSearch,
} from '@/lib/search-params'
import { Alerts } from '@/features/alerts'

const alertsSearchSchema = z.object({
  ...paginationSearch,
  from: dateSearch(),
  to: dateSearch(),
  vehicle: textSearch(),
  type: facetSearch(Object.keys(alertTypes) as AlertType[]),
})

export const Route = createFileRoute('/_authenticated/alerts/')({
  validateSearch: alertsSearchSchema,
  component: Alerts,
})
