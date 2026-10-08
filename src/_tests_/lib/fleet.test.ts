import {
  makeDelivery,
  makePosition,
  makeShift,
  makeTrip,
  ukTime,
} from '@/test-utils/fixtures'
import { describe, expect, it } from 'vitest'
import {
  buildFleet,
  findNextStop,
  getStopState,
  latestFix,
  tripAt,
} from './fleet'

describe('latestFix', () => {
  it('keeps the most recently recorded fix', () => {
    const older = makePosition({ recordedAt: ukTime('08:00') })
    const newer = makePosition({ recordedAt: ukTime('08:01') })

    expect(latestFix(older, newer)).toBe(newer)
    expect(latestFix(newer, older)).toBe(newer)
    expect(latestFix(undefined, older)).toBe(older)
    expect(latestFix(null, undefined)).toBeNull()
  })
})

describe('buildFleet', () => {
  it('collects the stops, progress and newest position of each van', () => {
    const shift = makeShift({
      lastPosition: makePosition({ recordedAt: ukTime('09:00') }),
    })
    const stops = [
      makeDelivery({ id: 'a', sequence: 1, status: 'completed' }),
      makeDelivery({ id: 'b', sequence: 2, status: 'skipped' }),
      makeDelivery({ id: 'c', sequence: 3 }),
      makeDelivery({ id: 'other', shiftId: 'shift-2' }),
    ]
    const live = makePosition({ recordedAt: ukTime('09:05') })

    const [van] = buildFleet([shift], stops, { 'vehicle-1': live })

    expect(van.stops.map((stop) => stop.id)).toEqual(['a', 'b', 'c'])
    expect(van.delivered).toBe(1)
    expect(van.position).toBe(live)
    expect(van.currentTrip?.id).toBe('trip-1')
  })
})

describe('stops over time', () => {
  const stops = [
    makeDelivery({
      id: 'a',
      status: 'completed',
      actualDeparture: ukTime('08:20'),
    }),
    makeDelivery({
      id: 'b',
      status: 'skipped',
      actualDeparture: ukTime('09:10'),
    }),
    makeDelivery({ id: 'c' }),
  ]

  it('shows stops as they were at a replay time', () => {
    const at = ukTime('09:00')
    const next = findNextStop(stops, at)

    expect(next?.id).toBe('b')
    expect(getStopState(stops[0], next?.id, at)).toBe('delivered')
    expect(getStopState(stops[1], next?.id, at)).toBe('next')
    expect(getStopState(stops[2], next?.id, at)).toBe('pending')
  })

  it('shows stops as they are now without a replay time', () => {
    const next = findNextStop(stops)

    expect(next?.id).toBe('c')
    expect(getStopState(stops[1], next?.id)).toBe('skipped')
    expect(getStopState(stops[2], next?.id)).toBe('next')
  })

  it('picks the trip under way at a time', () => {
    const trips = [
      makeTrip({ id: 't1', tripNumber: 1, startedAt: ukTime('07:00') }),
      makeTrip({ id: 't2', tripNumber: 2, startedAt: ukTime('12:00') }),
    ]

    expect(tripAt(trips, ukTime('06:00'))?.id).toBe('t1')
    expect(tripAt(trips, ukTime('10:00'))?.id).toBe('t1')
    expect(tripAt(trips, ukTime('12:30'))?.id).toBe('t2')
  })
})
