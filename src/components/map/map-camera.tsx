import { useEffect, useRef } from 'react'
import { LngLatBounds } from 'maplibre-gl'
import { type LatLng } from '@/api/common'
import { map } from './map-instance'

type MapFitBoundsProps = {
  points: LatLng[]
  maxZoom?: number
}

/**
 * Fits the camera to `points` the first time there are any.
 * Give it a new `key` to fit again (e.g. when another van is selected).
 */
export function MapFitBounds({ points, maxZoom = 14 }: MapFitBoundsProps) {
  const fitted = useRef(false)

  useEffect(() => {
    if (fitted.current || !points.length) return
    fitted.current = true
    const bounds = new LngLatBounds()
    for (const { lng, lat } of points) bounds.extend([lng, lat])
    const canvas = map.getCanvas()
    map.fitBounds(bounds, {
      padding: Math.min(canvas.clientWidth, canvas.clientHeight) * 0.1,
      maxZoom,
      duration: 0,
    })
  }, [points, maxZoom])

  return null
}

/** Keeps the map centred on a moving position ("Follow van"). */
export function MapFollow({ position }: { position: LatLng }) {
  const { lat, lng } = position

  useEffect(() => {
    map.easeTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 13) })
  }, [lat, lng])

  return null
}
