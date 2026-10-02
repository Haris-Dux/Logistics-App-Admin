import { type StyleSpecification } from 'maplibre-gl'
import { create } from 'zustand'

export type MapStyleId = 'map' | 'satellite'

/** Font for our own labels; must exist on the glyph server of every style. */
export const MAP_FONT = ['Noto Sans Bold']

const satelliteStyle: StyleSpecification = {
  version: 8,
  glyphs: import.meta.env.VITE_MAP_GLYPHS_URL,
  sources: {
    satellite: {
      type: 'raster',
      tiles: [import.meta.env.VITE_SATELLITE_TILES_URL],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Tiles © Esri, Maxar, Earthstar Geographics',
    },
  },
  layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }],
}

export const mapStyles: Record<
  MapStyleId,
  { label: string; style: string | StyleSpecification }
> = {
  map: { label: 'Map', style: import.meta.env.VITE_MAP_STYLE_URL },
  satellite: { label: 'Satellite', style: satelliteStyle },
}

interface MapStyleState {
  styleId: MapStyleId
  setStyleId: (styleId: MapStyleId) => void
}

/** The base map chosen by the admin, kept while moving between pages. */
export const useMapStyleStore = create<MapStyleState>()((set) => ({
  styleId: 'map',
  setStyleId: (styleId) => set({ styleId }),
}))
