import { z } from 'zod'

/** Page and page size for URL-synced tables. */
export const paginationSearch = {
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
}

/** An optional calendar day (`YYYY-MM-DD`); invalid values are dropped. */
export const dateSearch = () => z.iso.date().optional().catch(undefined)

/** Multi-select facet filter values. */
export const facetSearch = <T extends string>(values: readonly T[]) =>
  z.array(z.enum(values)).optional().catch([])

/** Per-column text filter. */
export const textSearch = () => z.string().optional().catch('')
