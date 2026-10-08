import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { deliveriesQueryOptions } from '@/api/deliveries'
import { shiftsQueryOptions } from '@/api/shifts'
import { useDepotId } from '@/stores/depot-store'
import { useFleetStore } from '@/stores/fleet-store'
import { todayParam } from '@/lib/dates'
import { buildFleet } from '@/lib/fleet'

const NO_LIVE_POSITIONS = {}

/** Every van on shift on `date` in the current depot, with its stops. */
export function useFleetDay(date: string) {
  const depotId = useDepotId()
  const filters = { from: date, to: date, depotId }
  const shifts = useQuery(shiftsQueryOptions(filters))
  const deliveries = useQuery(deliveriesQueryOptions(filters))
  const livePositions = useFleetStore((state) => state.positions)
  // Live updates only describe today
  const positions = date === todayParam() ? livePositions : NO_LIVE_POSITIONS

  const vans = useMemo(
    () => buildFleet(shifts.data ?? [], deliveries.data ?? [], positions),
    [shifts.data, deliveries.data, positions]
  )

  return {
    vans,
    deliveries: deliveries.data,
    isLoading: shifts.isLoading || deliveries.isLoading,
  }
}
