import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { facetSearch, paginationSearch, textSearch } from '@/lib/search-params'
import { Drivers } from '@/features/drivers'

const driversSearchSchema = z.object({
  ...paginationSearch,
  name: textSearch(),
  status: facetSearch(['active', 'inactive']),
})

export const Route = createFileRoute('/_authenticated/drivers/')({
  validateSearch: driversSearchSchema,
  component: Drivers,
})
