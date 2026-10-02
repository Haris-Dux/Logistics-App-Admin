import { shiftStatuses } from '@/config/statuses'
import { type Map as MapLibreMap } from 'maplibre-gl'
import { type ShiftStatus } from '@/api/shifts'

/** Lucide "truck" icon, drawn on a 24×24 grid. */
const TRUCK_PATHS = [
  'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2',
  'M15 18H9',
  'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14',
  'M15 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
  'M5 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
]
const ICON_SIZE = 30
const GLYPH_SIZE = 16

/** A white truck on a disc in the status colour (traccar's prepareIcon). */
function drawVanIcon(color: string) {
  const ratio = window.devicePixelRatio
  const canvas = document.createElement('canvas')
  canvas.width = ICON_SIZE * ratio
  canvas.height = ICON_SIZE * ratio
  const context = canvas.getContext('2d')!
  context.scale(ratio, ratio)

  context.beginPath()
  context.arc(ICON_SIZE / 2, ICON_SIZE / 2, ICON_SIZE / 2 - 1.5, 0, Math.PI * 2)
  context.fillStyle = color
  context.fill()
  context.lineWidth = 2
  context.strokeStyle = '#ffffff'
  context.stroke()

  const offset = (ICON_SIZE - GLYPH_SIZE) / 2
  context.translate(offset, offset)
  context.scale(GLYPH_SIZE / 24, GLYPH_SIZE / 24)
  context.lineCap = 'round'
  context.lineJoin = 'round'
  for (const path of TRUCK_PATHS) context.stroke(new Path2D(path))

  return context.getImageData(0, 0, canvas.width, canvas.height)
}

export const vanImageId = (status: ShiftStatus) => `van-${status}`

/** Adds marker icons to the current style; swapping styles drops them. */
export function addMapImages(map: MapLibreMap) {
  for (const [status, { color }] of Object.entries(shiftStatuses)) {
    const id = vanImageId(status as ShiftStatus)
    if (!map.hasImage(id)) {
      map.addImage(id, drawVanIcon(color), {
        pixelRatio: window.devicePixelRatio,
      })
    }
  }
}
