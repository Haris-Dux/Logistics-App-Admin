import { useMemo } from 'react'
import { type FeatureCollection } from 'geojson'
import { MAP_FONT } from './map-styles'
import { type MapLayer, useMapLayer } from './use-map-layer'

export type MapPoint = {
  id: string
  lat: number
  lng: number
  color: string
  /** Ring around the dot. */
  outline: string
  radius: number
  label?: string
  labelColor?: string
}

const POINT_LAYERS: MapLayer[] = [
  {
    key: 'dot',
    type: 'circle',
    paint: {
      'circle-radius': ['get', 'radius'],
      'circle-color': ['get', 'color'],
      'circle-stroke-color': ['get', 'outline'],
      'circle-stroke-width': 2,
    },
  },
  {
    key: 'label',
    type: 'symbol',
    filter: ['has', 'label'],
    layout: {
      'text-field': ['get', 'label'],
      'text-font': MAP_FONT,
      'text-size': 11,
      'text-allow-overlap': true,
    },
    paint: { 'text-color': ['get', 'labelColor'] },
  },
]

/** Labelled dots: numbered stops, the depot, proof-of-delivery locations. */
export function PointsLayer({ points }: { points: MapPoint[] }) {
  const data = useMemo<FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: points.map(({ lat, lng, ...properties }) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties,
      })),
    }),
    [points]
  )
  useMapLayer({ slot: 'points', layers: POINT_LAYERS, data })
  return null
}
