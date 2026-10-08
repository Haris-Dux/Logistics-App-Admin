import { describe, expect, it } from 'vitest'
import { atTimeOfDay, operationsDay, toDateTimeBounds } from './dates'

describe('dates', () => {
  it('reads planned times as UK time, whatever the browser time zone', () => {
    expect(atTimeOfDay('2026-10-01', '15:00').getTime()).toBe(
      Date.parse('2026-10-01T14:00:00Z')
    )
    expect(atTimeOfDay('2026-12-01', '15:00').getTime()).toBe(
      Date.parse('2026-12-01T15:00:00Z')
    )
  })

  it('finds the UK day of an instant', () => {
    expect(operationsDay(new Date('2026-09-30T23:30:00Z'))).toBe('2026-10-01')
  })

  it('turns a day range into UTC bounds of whole UK days', () => {
    expect(toDateTimeBounds({ from: '2026-10-01', to: '2026-10-02' })).toEqual({
      gte: '2026-09-30T23:00:00.000Z',
      lte: '2026-10-02T22:59:59.999Z',
    })
  })
})
