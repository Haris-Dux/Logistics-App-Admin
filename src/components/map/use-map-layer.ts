import { useEffect, useId } from 'react'
import { type FeatureCollection } from 'geojson'
import {
  type CircleLayerSpecification,
  type GeoJSONSource,
  type LineLayerSpecification,
  type MapLayerMouseEvent,
  type SymbolLayerSpecification,
} from 'maplibre-gl'
import { type MapSlot, map, mapSlots } from './map-instance'

type LayerEvent = 'click' | 'mouseenter' | 'mouseleave'
type LayerEvents = Partial<
  Record<LayerEvent, (event: MapLayerMouseEvent) => void>
>

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never

type SourcedLayer =
  | CircleLayerSpecification
  | LineLayerSpecification
  | SymbolLayerSpecification

export type MapLayer = DistributiveOmit<SourcedLayer, 'id' | 'source'> & {
  /** Suffix that keeps ids unique when a hook adds several layers. */
  key: string
  on?: LayerEvents
}

type UseMapLayerOptions = {
  slot: MapSlot
  /** Must be memoised: a new array rebuilds the layers. */
  layers: MapLayer[]
  /** Omit to drive the source yourself with `setData`. */
  data?: FeatureCollection
}

const EMPTY: FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
}

/**
 * Adds a GeoJSON source and its layers while mounted (traccar's useMapLayer).
 * New data only calls `setData`; layers are never rebuilt for it.
 */
export function useMapLayer({ slot, layers, data }: UseMapLayerOptions) {
  const id = useId()

  useEffect(() => {
    map.addSource(id, { type: 'geojson', data: EMPTY })
    for (const { key, on = {}, ...layer } of layers) {
      const layerId = `${id}-${key}`
      map.addLayer({ ...layer, id: layerId, source: id }, mapSlots[slot])
      for (const [type, listener] of Object.entries(on)) {
        map.on(type as LayerEvent, layerId, listener)
      }
    }
    return () => {
      for (const { key, on = {} } of layers) {
        const layerId = `${id}-${key}`
        for (const [type, listener] of Object.entries(on)) {
          map.off(type as LayerEvent, layerId, listener)
        }
        if (map.getLayer(layerId)) map.removeLayer(layerId)
      }
      if (map.getSource(id)) map.removeSource(id)
    }
  }, [id, layers, slot])

  // Runs after the source is (re)created, so rebuilt layers get the data too
  useEffect(() => {
    if (data) map.getSource<GeoJSONSource>(id)?.setData(data)
  }, [id, data, layers, slot])

  return id
}

/** Hover handlers that show a pointer over clickable features. */
export const pointerCursor: LayerEvents = {
  mouseenter: () => {
    map.getCanvas().style.cursor = 'pointer'
  },
  mouseleave: () => {
    map.getCanvas().style.cursor = ''
  },
}
