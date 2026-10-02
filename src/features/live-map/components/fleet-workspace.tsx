import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { depotMarker, stopStates } from '@/config/statuses'
import { Check, LocateFixed } from 'lucide-react'
import { depotsQueryOptions } from '@/api/depots'
import { positionsQueryOptions } from '@/api/positions'
import { atTimeOfDay, todayParam } from '@/lib/dates'
import { type FleetVan, findNextStop, getStopState, tripAt } from '@/lib/fleet'
import { formatAge } from '@/lib/format'
import { useNow } from '@/hooks/use-now'
import { Button } from '@/components/ui/button'
import { MapFitBounds, MapFollow } from '@/components/map/map-camera'
import { MapView } from '@/components/map/map-view'
import { type MapPoint, PointsLayer } from '@/components/map/points-layer'
import { RouteTrailLayer } from '@/components/map/route-trail-layer'
import {
  type VanMarker,
  VanMarkersLayer,
} from '@/components/map/van-markers-layer'
import { useReplay } from '../hooks/use-replay'
import { DayTimeline } from './day-timeline'
import { MapLegend } from './map-legend'
import { VanDetails } from './van-details'

type FleetWorkspaceProps = {
  vans: FleetVan[]
  selectedVan?: FleetVan
  date: string
  onSelect: (vehicleId: string) => void
}

/** The map with every van, plus trail, stops, timeline and details of the selected one. */
export function FleetWorkspace({
  vans,
  selectedVan,
  date,
  onSelect,
}: FleetWorkspaceProps) {
  const now = useNow()
  const shift = selectedVan?.shift
  const { data: positions = [] } = useQuery({
    ...positionsQueryOptions(shift?.id ?? ''),
    enabled: !!shift,
  })
  const { data: depots } = useQuery(depotsQueryOptions())
  const replay = useReplay(shift?.id, positions.length)
  const [follow, setFollow] = useState(false)

  const replayFix = replay.index === null ? undefined : positions[replay.index]
  const at = replayFix?.recordedAt
  const trip = shift && (at ? tripAt(shift.trips, at) : selectedVan.currentTrip)
  const tripId = trip?.id
  const tripStops = useMemo(
    () => selectedVan?.stops.filter((stop) => stop.tripId === tripId) ?? [],
    [selectedVan, tripId]
  )
  const nextStop = findNextStop(tripStops, at)
  const trail =
    replay.index === null ? positions : positions.slice(0, replay.index + 1)
  const selectedFix = replayFix ?? selectedVan?.position
  const depot = depots?.find((item) => item.id === shift?.depotId)

  const markers = useMemo<VanMarker[]>(
    () =>
      vans.flatMap(({ shift: vanShift, position }) => {
        const selected = vanShift.id === shift?.id
        const fix = selected && replayFix ? replayFix : position
        if (!fix) return []
        const status =
          selected && replayFix
            ? replayFix.speed > 1
              ? 'driving'
              : 'at_stop'
            : vanShift.status
        const registration = vanShift.vehicle.registration
        return {
          vehicleId: vanShift.vehicleId,
          lat: fix.lat,
          lng: fix.lng,
          status,
          label:
            status === 'offline'
              ? `${registration} · ${formatAge(fix.recordedAt, now)}`
              : registration,
          selected,
        }
      }),
    [vans, shift?.id, replayFix, now]
  )

  const points = useMemo<MapPoint[]>(() => {
    const stops = tripStops.map((stop): MapPoint => {
      const state = getStopState(stop, nextStop?.id, at)
      const pending = state === 'pending'
      return {
        id: stop.id,
        ...stop.location,
        color: stopStates[state].color,
        outline: pending ? depotMarker.color : '#ffffff',
        radius: 10,
        label: String(stop.sequence),
        labelColor: pending ? depotMarker.color : '#ffffff',
      }
    })
    if (!depot) return stops
    return [
      ...stops,
      {
        id: depot.id,
        ...depot.location,
        color: depotMarker.color,
        outline: '#ffffff',
        radius: 11,
        label: 'D',
        labelColor: '#ffffff',
      },
    ]
  }, [tripStops, nextStop?.id, at, depot])

  const fitPoints = shift
    ? [...trail, ...tripStops.map((stop) => stop.location)]
    : vans.flatMap(({ position }) => (position ? [position] : []))
  const isRunning = date === todayParam() && !shift?.endedAt
  const lastTrip = shift?.trips[shift.trips.length - 1]
  const plannedEnd = lastTrip && atTimeOfDay(date, lastTrip.plannedEnd)

  return (
    <>
      <section className='flex min-h-[70svh] min-w-0 flex-1 flex-col overflow-hidden rounded-md border max-lg:shrink-0 lg:min-h-0'>
        <div className='relative min-h-0 flex-1'>
          <MapView styleToggle>
            <VanMarkersLayer vans={markers} onSelect={onSelect} />
            {shift && <RouteTrailLayer points={trail} />}
            <PointsLayer points={points} />
            <MapFitBounds
              key={shift?.id ?? vans.map((van) => van.shift.id).join()}
              points={fitPoints}
            />
            {follow && selectedFix && <MapFollow position={selectedFix} />}
            <MapLegend />
            {shift && (
              <Button
                variant={follow ? 'default' : 'secondary'}
                className='absolute end-3 bottom-8 z-10 shadow-md'
                onClick={() => setFollow(!follow)}
              >
                {follow ? <Check /> : <LocateFixed />}
                Follow van
              </Button>
            )}
          </MapView>
        </div>
        {shift && (
          <DayTimeline
            title={shift.vehicle.registration}
            positions={positions}
            stops={selectedVan.stops}
            start={shift.startedAt}
            end={
              shift.endedAt ??
              (plannedEnd && plannedEnd > now ? plannedEnd : now)
            }
            now={isRunning ? now : undefined}
            index={replay.index ?? positions.length - 1}
            playing={replay.playing}
            onSeek={replay.seek}
            onPlay={replay.play}
            onPause={replay.pause}
          />
        )}
      </section>
      {selectedVan && (
        <VanDetails
          van={selectedVan}
          trip={trip ?? null}
          stops={tripStops}
          nextStop={nextStop}
          at={at}
          now={now}
          onReplay={replay.restart}
        />
      )}
    </>
  )
}
