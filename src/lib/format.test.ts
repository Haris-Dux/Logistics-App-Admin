import { describe, expect, it } from 'vitest'
import {
  formatAge,
  formatDuration,
  formatPence,
  formatPercent,
  formatSpeed,
  formatTime,
} from './format'

describe('format', () => {
  const now = new Date('2026-10-01T10:00:00Z')
  const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000)

  it('shows compact ages', () => {
    expect(formatAge(ago(20), now)).toBe('20 s')
    expect(formatAge(ago(12 * 60), now)).toBe('12 min')
    expect(formatAge(ago(3 * 3600), now)).toBe('3 h')
    expect(formatAge(ago(50 * 3600), now)).toBe('2 d')
    expect(formatAge(ago(-30), now)).toBe('0 s')
  })

  it('shows durations in minutes or hours', () => {
    expect(formatDuration(24)).toBe('24 min')
    expect(formatDuration(125)).toBe('2 h 05 min')
  })

  it('formats times in UK time', () => {
    expect(formatTime(new Date('2026-10-01T09:07:00Z'))).toBe('10:07')
  })

  it('formats speed, money and percentages', () => {
    expect(formatSpeed(12.5)).toBe('28 mph')
    expect(formatPence(103000)).toBe('£1,030.00')
    expect(formatPercent(3, 4)).toBe('75%')
    expect(formatPercent(0, 0)).toBe('—')
  })
})
