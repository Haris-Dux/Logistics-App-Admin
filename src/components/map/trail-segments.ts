import {
  type FeatureCollection,
  type LineString,
  type Position as Coordinates,
} from 'geojson'
import { type Position } from '@/api/positions'

export type TrailPoint = Pick<Position, 'lat' | 'lng' | 'late'>

/**
 * Splits a trail into lines wherever late points (filled in after a loss of
 * signal) start or stop, so those stretches can be drawn dashed.
 */
export function toTrailSegments(
  points: TrailPoint[]
): FeatureCollection<LineString, { late: boolean }> {
  const segments: { late: boolean; coordinates: Coordinates[] }[] = []
  for (let i = 1; i < points.length; i++) {
    const from = points[i - 1]
    const to = points[i]
    const late = from.late || to.late
    let segment = segments[segments.length - 1]
    if (segment?.late !== late) {
      segment = { late, coordinates: [[from.lng, from.lat]] }
      segments.push(segment)
    }
    segment.coordinates.push([to.lng, to.lat])
  }
  return {
    type: 'FeatureCollection',
    features: segments.map(({ late, coordinates }) => ({
      type: 'Feature',
      properties: { late },
      geometry: { type: 'LineString', coordinates },
    })),
  }
}
