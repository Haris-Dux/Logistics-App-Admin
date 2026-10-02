import { type StopState } from '@/config/statuses'
import { type Delivery } from '@/api/deliveries'
import { type GpsFix, type Position } from '@/api/positions'
import { type Shift } from '@/api/shifts'
import { type Trip } from '@/api/trips'

/** A van on shift with everything the live screens show about it. */
export type FleetVan = {
  shift: Shift
  /** Newest known fix: live socket update or the last one from the API. */
  position: GpsFix | null
  /** Stops for the day across all trips, in driving order. */
  stops: Delivery[]
  delivered: number
  currentTrip: Trip | null
}

/** The more recently recorded of two fixes, so late uploads never win. */
export function latestFix<T extends GpsFix>(
  a: T | null | undefined,
  b: T | null | undefined
): T | null {
  if (!a || !b) return a ?? b ?? null
  return b.recordedAt > a.recordedAt ? b : a
}

const isDone = (stop: Delivery) => stop.status !== 'pending'

function currentTrip(trips: Trip[]) {
  const ordered = [...trips].sort((a, b) => a.tripNumber - b.tripNumber)
  return (
    ordered.find((trip) => trip.status === 'STARTED') ??
    ordered.find((trip) => !trip.endedAt) ??
    ordered[ordered.length - 1] ??
    null
  )
}

export function buildFleet(
  shifts: Shift[],
  deliveries: Delivery[],
  livePositions: Record<string, Position>
): FleetVan[] {
  return shifts.map((shift) => {
    const stops = deliveries.filter((stop) => stop.shiftId === shift.id)
    return {
      shift,
      position: latestFix<GpsFix>(
        livePositions[shift.vehicleId],
        shift.lastPosition
      ),
      stops,
      delivered: stops.filter((stop) => stop.status === 'completed').length,
      currentTrip: currentTrip(shift.trips),
    }
  })
}

/** The trip under way at time `at`: the last one started by then. */
export function tripAt(trips: Trip[], at: Date) {
  const started = trips
    .filter((trip) => trip.startedAt && trip.startedAt <= at)
    .sort((a, b) => a.tripNumber - b.tripNumber)
  return started[started.length - 1] ?? trips[0] ?? null
}

/**
 * How a stop looked at time `at` (for replays); without `at`, its state now.
 * `nextStopId` is the first stop not yet done at that time.
 */
export function getStopState(
  stop: Delivery,
  nextStopId: string | undefined,
  at?: Date
): StopState {
  const done = at
    ? !!stop.actualDeparture && stop.actualDeparture <= at
    : isDone(stop)
  if (done) return stop.status === 'skipped' ? 'skipped' : 'delivered'
  return stop.id === nextStopId ? 'next' : 'pending'
}

/** First stop not yet finished at time `at`. */
export const findNextStop = (stops: Delivery[], at?: Date) =>
  stops.find((stop) =>
    at ? !stop.actualDeparture || stop.actualDeparture > at : !isDone(stop)
  )
