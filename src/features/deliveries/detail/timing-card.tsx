import { differenceInMinutes } from 'date-fns'
import { stopStates, windowResults } from '@/config/statuses'
import { type Delivery } from '@/api/deliveries'
import { getWindowResult } from '@/lib/deliveries'
import { formatDuration, formatTime } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapFitBounds } from '@/components/map/map-camera'
import { MapView } from '@/components/map/map-view'
import { type MapPoint, PointsLayer } from '@/components/map/points-layer'
import { DetailList } from './detail-list'

export function TimingCard({ delivery }: { delivery: Delivery }) {
  const { actualArrival, actualDeparture, pod } = delivery
  const result = getWindowResult(delivery)
  const points: MapPoint[] = [
    {
      id: 'stop',
      ...delivery.location,
      color: stopStates.delivered.color,
      outline: '#ffffff',
      radius: 10,
      label: String(delivery.sequence),
      labelColor: '#ffffff',
    },
  ]
  if (pod) {
    points.push({
      id: 'pod',
      ...pod.location,
      color: stopStates.next.color,
      outline: '#ffffff',
      radius: 6,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timing</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <DetailList
          items={[
            ['Time window', delivery.timeWindow.join(' – ')],
            ['Planned arrival', delivery.arrival],
            [
              'Actual arrival',
              actualArrival && (
                <span className='font-semibold'>
                  {formatTime(actualArrival)}
                </span>
              ),
            ],
            ['Departure', actualDeparture && formatTime(actualDeparture)],
            [
              'Time on site',
              actualArrival &&
                actualDeparture &&
                formatDuration(
                  differenceInMinutes(actualDeparture, actualArrival)
                ),
            ],
            [
              'Result',
              result && (
                <span
                  className='font-semibold'
                  style={{ color: windowResults[result].color }}
                >
                  {windowResults[result].label}
                </span>
              ),
            ],
          ]}
        />
        <div className='h-48 overflow-hidden rounded-md border'>
          <MapView>
            <PointsLayer points={points} />
            <MapFitBounds points={points} maxZoom={16} />
          </MapView>
        </div>
        {pod && (
          <p className='text-xs text-muted-foreground'>
            Blue dot: where the driver was when the delivery was marked done.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
