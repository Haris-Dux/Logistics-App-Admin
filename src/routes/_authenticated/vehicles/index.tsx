import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { vehicleStatuses } from '@/config/statuses'
import { type VehicleStatus } from '@/api/vehicles'
import { facetSearch, paginationSearch, textSearch } from '@/lib/search-params'
import { Vehicles } from '@/features/vehicles'
import {
  type Availability,
  availabilities,
} from '@/features/vehicles/data/data'

const vehiclesSearchSchema = z.object({
  ...paginationSearch,
  registration: textSearch(),
  status: facetSearch(Object.keys(vehicleStatuses) as VehicleStatus[]),
  availability: facetSearch(Object.keys(availabilities) as Availability[]),
})

export const Route = createFileRoute('/_authenticated/vehicles/')({
  validateSearch: vehiclesSearchSchema,
  component: Vehicles,
})
