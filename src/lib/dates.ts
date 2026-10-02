import { endOfDay, format, parseISO, startOfDay, subDays } from 'date-fns'
import { tz } from '@date-fns/tz'
import { type DateRange } from '@/api/common'

/**
 * Depots run on UK time. Calendar days, planned times (`HH:mm`) and every
 * displayed time use it, wherever the admin happens to be.
 */
export const inOperationsTimeZone = { in: tz('Europe/London') }

/** `YYYY-MM-DD` of a day picked in a calendar (a local date). */
export const toDateParam = (day: Date) => format(day, 'yyyy-MM-dd')

/** The operations day (`YYYY-MM-DD`) an instant falls on. */
export const operationsDay = (instant: Date) =>
  format(instant, 'yyyy-MM-dd', inOperationsTimeZone)

export const todayParam = () => operationsDay(new Date())

/** The last `count` days up to and including today. */
export const recentDays = (count: number): DateRange => ({
  from: toDateParam(subDays(parseISO(todayParam()), count - 1)),
  to: todayParam(),
})

/** UTC instants spanning whole operations days, for timestamp range filters. */
export function toDateTimeBounds({ from, to }: DateRange) {
  const toUtc = (date: Date) => new Date(date.getTime()).toISOString()
  return {
    gte: toUtc(
      startOfDay(parseISO(from, inOperationsTimeZone), inOperationsTimeZone)
    ),
    lte: toUtc(
      endOfDay(parseISO(to, inOperationsTimeZone), inOperationsTimeZone)
    ),
  }
}

/** A planned time (`HH:mm`) on an operations day (`YYYY-MM-DD`). */
export const atTimeOfDay = (date: string, time: string) =>
  parseISO(`${date}T${time}`, inOperationsTimeZone)
