import { describe, expect, it } from 'vitest'
import { toTrailSegments } from './trail-segments'

const point = (lng: number, late = false) => ({ lat: 51.5, lng, late })

describe('toTrailSegments', () => {
  it('draws stretches filled in after signal loss as separate late lines', () => {
    const { features } = toTrailSegments([
      point(0),
      point(1),
      point(2, true),
      point(3, true),
      point(4),
      point(5),
    ])

    expect(
      features.map(({ properties, geometry }) => [
        properties.late,
        geometry.coordinates.map(([lng]) => lng),
      ])
    ).toEqual([
      [false, [0, 1]],
      [true, [1, 2, 3, 4]],
      [false, [4, 5]],
    ])
  })

  it('has no lines for fewer than two points', () => {
    expect(toTrailSegments([point(0)]).features).toEqual([])
  })
})
