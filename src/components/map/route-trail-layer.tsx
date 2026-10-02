import { useMemo } from 'react'
import { trailColor } from '@/config/statuses'
import { type TrailPoint, toTrailSegments } from './trail-segments'
import { type MapLayer, useMapLayer } from './use-map-layer'

const TRAIL_LAYERS: MapLayer[] = [
  {
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
export function RouteTrailLayer({ points }: { points: TrailPoint[] }) {
  const data = useMemo(() => toTrailSegments(points), [points])
  useMapLayer({ slot: 'trails', layers: TRAIL_LAYERS, data })
  return null
}
