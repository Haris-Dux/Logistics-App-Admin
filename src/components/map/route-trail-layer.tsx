import { useMemo } from 'react'
import { trailColor } from '@/config/statuses'
import { type TrailPoint, toTrailSegments } from './trail-segments'
import { type MapLayer, useMapLayer } from './use-map-layer'

type LineLayer = Extract<MapLayer, { type: 'line' }>
const TRAIL_LAYERS: LineLayer[] = [  {
    key: 'live',
    type: 'line',
    filter: ['==', ['get', 'late'], false],
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': trailColor, 'line-width': 4 },
  },
  {
    key: 'late',
    type: 'line',
    filter: ['==', ['get', 'late'], true],
    layout: { 'line-join': 'round' },
    paint: {
      'line-color': trailColor,
      'line-width': 4,
      'line-dasharray': [1.5, 1.5],
    },
  },
]

/** The route a van has driven; dashed where it was filled in late. */
export function RouteTrailLayer({
  points,
  color = trailColor,
}: {
  points: TrailPoint[]
  color?: string
}) {
  const data = useMemo(() => toTrailSegments(points), [points])
  const layers = useMemo(
    () =>
      TRAIL_LAYERS.map((layer) => ({
        ...layer,
        paint: {
          ...layer.paint,
          'line-color': color,
        },
      })),
    [color]
  )

  useMapLayer({ slot: 'trails', layers, data })
  return null
}
