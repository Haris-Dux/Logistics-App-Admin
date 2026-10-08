import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { depotMarker, stopStates } from '@/config/statuses'
import { Check, LocateFixed } from 'lucide-react'
import { depotsQueryOptions } from '@/api/depots'
import { positionsQueryOptions } from '@/api/positions'
import { atTimeOfDay, todayParam } from '@/lib/dates'
import { type FleetVan, findNextStop, getStopState, tripAt } from '@/lib/fleet'
import { formatAge } from '@/lib/format'
import { getTripColor } from '@/lib/trip-colors'
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
  const [selectedTripId, setSelectedTripId] = useState<string>('all')
  const [replayEnded, setReplayEnded] = useState(false)

  useEffect(() => {
    setSelectedTripId('all')
    setReplayEnded(false)
  }, [shift?.id])

  const replayIndex = replayEnded ? null : replay.index
  const replayFix = replayIndex === null ? undefined : positions[replayIndex]
  const at = replayFix?.recordedAt
  const trip = !shift
    ? undefined
    : at
      ? tripAt(shift.trips, at)
      : selectedTripId === 'all'
        ? undefined
        : (shift.trips.find((item) => item.id === selectedTripId) ??
          selectedVan?.currentTrip)
  const tripId = trip?.id
  const showAll = !at && selectedTripId === 'all'

  const tripStops = useMemo(() => {
    if (!selectedVan) return []
    if (tripId) return selectedVan.stops.filter((s) => s.tripId === tripId)
    return selectedTripId === 'all' ? selectedVan.stops : []
  }, [selectedVan, selectedTripId, tripId])

  const nextStop = findNextStop(tripStops, at)

  const trail = useMemo(
    () =>
      replayIndex === null ? positions : positions.slice(0, replayIndex + 1),
    [positions, replayIndex]
  )

  const tripTrails = useMemo(() => {
    if (!shift || (!showAll && !trip)) return []

    const grouped = new Map<string, { color: string; points: typeof trail }>()
    for (const point of trail) {
      const pointTrip = tripAt(shift.trips, point.recordedAt)
      if (!pointTrip || (!showAll && pointTrip.id !== trip?.id)) continue

      const group = grouped.get(pointTrip.id) ?? {
        color: getTripColor(pointTrip.tripNumber),
        points: [] as typeof trail,
      }
      group.points.push(point)
      grouped.set(pointTrip.id, group)
    }

    return Array.from(grouped, ([id, group]) => ({ tripId: id, ...group }))
  }, [shift, trip, trail, showAll])

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

  const fitPoints = useMemo(
    () =>
      shift
        ? [
            ...tripTrails.flatMap((t) => t.points),
            ...tripStops.map((s) => s.location),
          ]
        : vans.flatMap(({ position }) => (position ? [position] : [])),
    [shift, tripTrails, tripStops, vans]
  )

  const isRunning = date === todayParam() && !shift?.endedAt
  const lastTrip = shift?.trips[shift.trips.length - 1]
  const plannedEnd = lastTrip && atTimeOfDay(date, lastTrip.plannedEnd)

  return (
    <>
      <section className='flex min-h-[70svh] min-w-0 flex-1 flex-col overflow-hidden rounded-md border max-lg:shrink-0 lg:min-h-0'>
        <div className='relative min-h-0 flex-1'>
          <MapView styleToggle>
            <VanMarkersLayer vans={markers} onSelect={onSelect} />
            {tripTrails.map(({ tripId: id, points: trailPoints, color }) => (
              <RouteTrailLayer key={id} points={trailPoints} color={color} />
            ))}
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
        {selectedVan && shift && (
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
            index={replayIndex ?? positions.length - 1}
            playing={replay.playing}
            onSeek={(index) => {
              setReplayEnded(false)
              replay.seek(index)
            }}
            onPlay={() => {
              setReplayEnded(false)
              replay.play()
            }}
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
          onReplay={() => {
            setSelectedTripId(shift?.trips[0]?.id ?? 'all')
            setReplayEnded(false)
            replay.restart()
          }}
          onSelectTrip={(id) => {
            if (id === 'all') {
              replay.pause()
              setReplayEnded(true)
            }
            setSelectedTripId(id)
          }}
          selectedTripId={at ? (tripId ?? selectedTripId) : selectedTripId}
        />
      )}
    </>
  )
}
