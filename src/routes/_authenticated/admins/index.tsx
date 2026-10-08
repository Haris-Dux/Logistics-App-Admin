import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { facetSearch, paginationSearch, textSearch } from '@/lib/search-params'
import { Admins } from '@/features/admins'

const adminsSearchSchema = z.object({
  ...paginationSearch,
  name: textSearch(),
  status: facetSearch(['active', 'inactive']),
})

export const Route = createFileRoute('/_authenticated/admins/')({
  validateSearch: adminsSearchSchema,
  component: Admins,
})
