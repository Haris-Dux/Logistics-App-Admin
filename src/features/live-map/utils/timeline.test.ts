import { makePosition, ukTime } from '@/test-utils/fixtures'
import { describe, expect, it } from 'vitest'
import { buildTimelineSegments, indexAtTime } from './timeline'

const at = (time: string, speed: number, late = false) =>
  makePosition({ recordedAt: ukTime(time), speed, late })

describe('buildTimelineSegments', () => {
  it('splits the day into checks, driving, stops and late uploads', () => {
    const positions = [
      at('06:30', 0),
      at('06:45', 0),
      at('07:00', 10),
      at('07:15', 10),
      at('07:30', 0),
      at('07:45', 0),
      at('08:00', 10, true),
      at('08:15', 10),
    ]

    expect(
      buildTimelineSegments(positions).map(({ kind, from, to }) => [
        kind,
        from.toISOString().slice(11, 16),
        to.toISOString().slice(11, 16),
      ])
    ).toEqual([
      ['checks', '05:30', '05:45'],
      ['driving', '05:45', '06:30'],
      ['stopped', '06:30', '06:45'],
      ['no_signal', '06:45', '07:15'],
    ])
  })
})

describe('indexAtTime', () => {
  it('finds the last position recorded at or before a time', () => {
    const positions = [at('08:00', 0), at('08:02', 0), at('08:04', 0)]

    expect(indexAtTime(positions, ukTime('07:00'))).toBe(0)
    expect(indexAtTime(positions, ukTime('08:03'))).toBe(1)
    expect(indexAtTime(positions, ukTime('09:00'))).toBe(2)
  })
})
