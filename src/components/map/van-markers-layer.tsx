import { useEffect, useMemo, useRef } from 'react'
import { shiftStatuses } from '@/config/statuses'
import { type GeoJSONSource } from 'maplibre-gl'
import { type ShiftStatus } from '@/api/shifts'
import { vanImageId } from './map-images'
import { map } from './map-instance'
import { MAP_FONT } from './map-styles'
import { type MapLayer, pointerCursor, useMapLayer } from './use-map-layer'

export type VanMarker = {
  vehicleId: string
  lat: number
  lng: number
  status: ShiftStatus
  label: string
  selected: boolean
}

type VanMarkersLayerProps = {
  vans: VanMarker[]
  /** Must be memoised. */
  onSelect?: (vehicleId: string) => void
}

type Coordinates = [number, number]

const ANIMATION_MS = 1000
/** Longer jumps (in degrees, about 5 km) snap instead of gliding. */
const MAX_GLIDE = 0.05

const glide = (from: Coordinates, to: Coordinates, progress: number) =>
  [
    from[0] + (to[0] - from[0]) * progress,
    from[1] + (to[1] - from[1]) * progress,
  ] as Coordinates

/** Van markers that glide to each new position instead of jumping. */
export function VanMarkersLayer({ vans, onSelect }: VanMarkersLayerProps) {
  const layers = useMemo<MapLayer[]>(
    () => [
      {
        key: 'halo',
        type: 'circle',
        filter: ['==', ['get', 'selected'], true],
        paint: {
          'circle-radius': 24,
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.25,
        },
      },
      {
        key: 'icon',
        type: 'symbol',
        layout: {
          'icon-image': ['get', 'image'],
          'icon-allow-overlap': true,
          'symbol-sort-key': ['case', ['get', 'selected'], 1, 0],
          'text-field': ['get', 'label'],
          'text-font': MAP_FONT,
          'text-size': 12,
          'text-anchor': 'top',
          'text-offset': [0, 1.3],
          'text-optional': true,
        },
        paint: {
          'text-color': '#0f172a',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        },
        on: onSelect && {
          ...pointerCursor,
          click: (event) => {
            const vehicleId = event.features?.[0]?.properties.vehicleId
            if (typeof vehicleId === 'string') onSelect(vehicleId)
          },
        },
      },
    ],
    [onSelect]
  )
  const sourceId = useMapLayer({ slot: 'vans', layers })
  const shown = useRef(new Map<string, Coordinates>())

  useEffect(() => {
    const source = map.getSource<GeoJSONSource>(sourceId)
    if (!source) return
    const from = new Map(shown.current)

    const render = (progress: number) => {
      source.setData({
        type: 'FeatureCollection',
        features: vans.map((van) => {
          const target: Coordinates = [van.lng, van.lat]
          const start = from.get(van.vehicleId)
          const point = start ? glide(start, target, progress) : target
          shown.current.set(van.vehicleId, point)
          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: point },
            properties: {
              vehicleId: van.vehicleId,
              image: vanImageId(van.status),
              color: shiftStatuses[van.status].color,
              label: van.label,
              selected: van.selected,
            },
          }
        }),
      })
    }

    const gliding = vans.some((van) => {
      const start = from.get(van.vehicleId)
      if (!start) return false
      const distance = Math.hypot(van.lng - start[0], van.lat - start[1])
      if (distance > MAX_GLIDE) from.delete(van.vehicleId)
      return distance > 0 && distance <= MAX_GLIDE
    })
    if (!gliding) {
      render(1)
      return
    }

    const startedAt = performance.now()
    let frame = requestAnimationFrame(function step(now) {
      const progress = Math.min(1, (now - startedAt) / ANIMATION_MS)
      render(progress)
      if (progress < 1) frame = requestAnimationFrame(step)
    })
    return () => cancelAnimationFrame(frame)
  }, [sourceId, vans, layers])

  return null
}
