import { z } from 'zod'

export const latLngSchema = z.object({ lat: z.number(), lng: z.number() })
export type LatLng = z.infer<typeof latLngSchema>

/** A calendar day, `YYYY-MM-DD`. */
export const dateSchema = z.iso.date()

/** A local time of day, `HH:mm`. */
export const timeOfDaySchema = z.iso.time({ precision: -1 })

export const containerCountsSchema = z.object({
  cages: z.number(),
  pallets: z.number(),
  totes: z.number(),
})
export type ContainerCounts = z.infer<typeof containerCountsSchema>

/** Inclusive range of calendar days (`YYYY-MM-DD`). */
export type DateRange = { from: string; to: string }

/** Filters shared by depot-scoped resources (`undefined` = all depots). */
export type DepotFilter = { depotId?: string }
