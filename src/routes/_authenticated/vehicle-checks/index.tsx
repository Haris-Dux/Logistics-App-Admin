import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import {
  dateSearch,
  facetSearch,
  paginationSearch,
  textSearch,
} from '@/lib/search-params'
import { VehicleChecks } from '@/features/vehicle-checks'
import {
  type CheckResult,
  checkResults,
} from '@/features/vehicle-checks/data/data'

const vehicleChecksSearchSchema = z.object({
  ...paginationSearch,
  /** Day to show; today when omitted. */
  date: dateSearch(),
  /** Check shown in the detail panel. */
  check: z.string().optional().catch(undefined),
  vehicle: textSearch(),
  result: facetSearch(Object.keys(checkResults) as CheckResult[]),
})

export const Route = createFileRoute('/_authenticated/vehicle-checks/')({
  validateSearch: vehicleChecksSearchSchema,
  component: VehicleChecks,
})
