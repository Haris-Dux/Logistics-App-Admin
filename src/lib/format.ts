import { format, parseISO } from 'date-fns'
import { inOperationsTimeZone } from './dates'

const MPH_PER_MPS = 2.236_94

const gbp = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

/** Clock time in operations time, `HH:mm`. */
export const formatTime = (date: Date) =>
  format(date, 'HH:mm', inOperationsTimeZone)

/** Date and time in operations time, e.g. `1 Oct 2026, 14:05`. */
export const formatDateTime = (date: Date) =>
  format(date, 'd MMM yyyy, HH:mm', inOperationsTimeZone)

/** A calendar day (`YYYY-MM-DD`), e.g. `1 Oct 2026`. */
export const formatDay = (day: string) => format(parseISO(day), 'd MMM yyyy')

/** Compact elapsed time since `date`: `20 s`, `12 min`, `3 h`, `2 d`. */
export function formatAge(date: Date, now: Date) {
  const seconds = Math.max(
    0,
    Math.round((now.getTime() - date.getTime()) / 1000)
  )
  if (seconds < 60) return `${seconds} s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h`
  return `${Math.floor(hours / 24)} d`
}

/** Minutes as `45 min` or `2 h 05 min`. */
export function formatDuration(totalMinutes: number) {
  const minutes = Math.round(totalMinutes)
  if (minutes < 60) return `${minutes} min`
  const rest = minutes % 60
  return `${Math.floor(minutes / 60)} h ${String(rest).padStart(2, '0')} min`
}

/** Speed in metres per second shown in miles per hour. */
export const formatSpeed = (metresPerSecond: number) =>
  `${Math.round(metresPerSecond * MPH_PER_MPS)} mph`

/** Pence as pounds, e.g. `£1,030.00`. */
export const formatPence = (pence: number) => gbp.format(pence / 100)

/** Whole percentage, or an em dash when there is nothing to measure. */
export const formatPercent = (part: number, total: number) =>
  total ? `${Math.round((part / total) * 100)}%` : '—'
