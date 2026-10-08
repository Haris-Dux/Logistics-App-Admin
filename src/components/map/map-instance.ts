import {
  AttributionControl,
  Map as MapLibreMap,
  NavigationControl,
  setWorkerUrl,
} from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { addMapImages } from './map-images'
import { type MapStyleId, mapStyles } from './map-styles'

setWorkerUrl(workerUrl)

/*
 * One map for the whole app (as in traccar-web): creating a WebGL context per
 * page is slow and browsers cap how many can exist. Each <MapView> borrows
 * `mapElement` while it is mounted.
 */
export const mapElement = document.createElement('div')
mapElement.style.width = '100%'
mapElement.style.height = '100%'

export const map = new MapLibreMap({
  container: mapElement,
  attributionControl: false,
  center: [-0.3, 51.5],
  zoom: 9,
})
map.addControl(new AttributionControl({ compact: true }), 'bottom-right')
map.addControl(new NavigationControl({ showCompass: false }), 'top-right')

/** Layer stacking: layers go below their slot, so later slots draw on top. */
export const mapSlots = {
  trails: 'slot-trails',
  points: 'slot-points',
  vans: 'slot-vans',
} as const
export type MapSlot = keyof typeof mapSlots

let ready = false
const readyListeners = new Set<() => void>()

function setReady(value: boolean) {
  ready = value
  readyListeners.forEach((listener) => listener())
}

/** Subscription for `useSyncExternalStore`: is the current style loaded? */
export const mapReadyStore = {
  subscribe: (listener: () => void) => {
    readyListeners.add(listener)
    return () => {
      readyListeners.delete(listener)
    }
  },
  getSnapshot: () => ready,
}

let appliedStyleId: MapStyleId | null = null
let styleTimer: ReturnType<typeof setTimeout> | undefined

/** Swaps the base map; layers unmount until the new style has loaded. */
export function applyMapStyle(styleId: MapStyleId) {
  if (styleId === appliedStyleId) return
  appliedStyleId = styleId
  clearTimeout(styleTimer)
  setReady(false)
  map.setStyle(mapStyles[styleId].style, { diff: false })

  const onStyleLoaded = () => {
    if (!map.isStyleLoaded()) {
      styleTimer = setTimeout(onStyleLoaded, 33)
      return
    }
    addMapImages(map)
    for (const id of Object.values(mapSlots)) {
      map.addLayer({ id, type: 'background', layout: { visibility: 'none' } })
    }
    setReady(true)
  }
  map.once('styledata', onStyleLoaded)
}
