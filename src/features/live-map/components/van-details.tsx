import { Link } from '@tanstack/react-router'
import { shiftStatuses, windowResults } from '@/config/statuses'
import { History, MessageSquare } from 'lucide-react'
import { type Delivery } from '@/api/deliveries'
import { type Trip } from '@/api/trips'
import { getWindowResult } from '@/lib/deliveries'
import { type FleetVan, getStopState } from '@/lib/fleet'
import { formatAge, formatSpeed, formatTime } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DeliveryProgress } from '@/components/delivery-progress'
import { StatusBadge } from '@/components/status-badge'
import { StopNumber } from './stop-number'

type VanDetailsProps = {
  van: FleetVan
  trip: Trip | null
  stops: Delivery[]
  nextStop: Delivery | undefined
  /** Replay time; stops show their state at that moment. */
  at?: Date
  now: Date
  onReplay: () => void
}

/** Arrival recorded by time `at` (any time when not replaying). */
const arrivedBy = (stop: Delivery, at?: Date) =>
  stop.actualArrival && (!at || stop.actualArrival <= at)
    ? stop.actualArrival
    : null

function StopTimes({ stop, at }: { stop: Delivery; at?: Date }) {
  const arrival = arrivedBy(stop, at)
  if (!arrival) return <>ETA {stop.eta ? formatTime(stop.eta) : stop.arrival}</>
  if (stop.status === 'skipped') return <>skipped {formatTime(arrival)}</>
  return (
    <>
      {stop.arrival} → {formatTime(arrival)}
    </>
  )
}

export function VanDetails({
  van,
  trip,
  stops,
  nextStop,
  at,
  now,
  onReplay,
}: VanDetailsProps) {
  const { shift, position } = van
  const states = stops.map((stop) => getStopState(stop, nextStop?.id, at))
  const delivered = states.filter((state) => state === 'delivered').length
  const skipped = states.filter((state) => state === 'skipped').length
  const status = shiftStatuses[shift.status]
  const nextResult = nextStop && getWindowResult(nextStop)

  return (
    <aside className='flex min-h-0 flex-col gap-4 rounded-md border p-4 max-lg:shrink-0 lg:w-80 xl:w-96'>
      <div className='space-y-1'>
        <div className='flex flex-wrap items-center gap-2'>
          <h3 className='text-xl font-bold'>{shift.vehicle.registration}</h3>
          <StatusBadge
            status={
              shift.status === 'driving' && position
                ? {
                    ...status,
                    label: `${status.label} · ${formatSpeed(position.speed)}`,
                  }
                : status
            }
          />
        </div>
        <p className='text-sm text-muted-foreground'>
          {shift.driver.name} · Route {shift.routeNumber}
          {trip && ` · Trip ${trip.tripNumber} of ${shift.trips.length}`}
          {position &&
            ` · last update ${formatAge(position.recordedAt, now)} ago`}
        </p>
      </div>

      <div className='space-y-2'>
        <DeliveryProgress done={delivered} total={stops.length} />
        <p className='text-sm'>
          <span className='font-semibold'>
            {delivered} of {stops.length}
          </span>{' '}
          delivered
          {skipped > 0 && (
            <span className='text-destructive'> · {skipped} skipped</span>
          )}{' '}
          · {stops.length - delivered - skipped} to go
        </p>
      </div>

      {nextStop && (
        <div className='rounded-md border border-blue-600 bg-blue-600/5 p-3 text-sm'>
          <p className='text-xs font-medium text-muted-foreground uppercase'>
            Next stop
          </p>
          <p className='font-semibold'>
            {nextStop.sequence} · {nextStop.customerName}, {nextStop.postcode}
          </p>
          <p>
            <StopTimes stop={nextStop} at={at} /> · window{' '}
            {nextStop.timeWindow.join('–')}
            {nextResult && (
              <span
                className='font-semibold'
                style={{ color: windowResults[nextResult].color }}
              >
                {' '}
                {nextResult === 'late' ? 'late' : 'on time'}
              </span>
            )}
          </p>
        </div>
      )}

      <div className='flex min-h-0 flex-1 flex-col gap-2'>
        <p className='text-xs font-medium text-muted-foreground uppercase'>
          Stops (planned → actual)
        </p>
        <ScrollArea className='min-h-0 flex-1'>
          <ul className='divide-y pe-3'>
            {stops.map((stop, index) => {
              const state = states[index]
              const done = state === 'delivered' || state === 'skipped'
              return (
                <li
                  key={stop.id}
                  className='flex items-center gap-3 py-2 text-sm'
                >
                  <StopNumber sequence={stop.sequence} state={state} />
                  <span className='min-w-0 flex-1 truncate'>
                    {stop.customerName}
                    {done && stop.skipReason && (
                      <span className='text-muted-foreground'>
                        {' '}
                        · {stop.skipReason}
                      </span>
                    )}
                  </span>
                  <span className='shrink-0 text-muted-foreground tabular-nums'>
                    <StopTimes stop={stop} at={at} />
                  </span>
                </li>
              )
            })}
          </ul>
        </ScrollArea>
      </div>

      <div className='flex flex-wrap gap-2'>
        <Button asChild>
          <Link to='/messages' search={{ driver: shift.driverId }}>
            <MessageSquare />
            Message driver
          </Link>
        </Button>
        <Button variant='outline' onClick={onReplay}>
          <History />
          Replay day
        </Button>
      </div>
    </aside>
  )
}
