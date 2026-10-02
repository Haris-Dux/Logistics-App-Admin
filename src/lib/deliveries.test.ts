import { makeDelivery, ukTime } from '@/test-utils/fixtures'
import { describe, expect, it } from 'vitest'
import { getDeliveryState, getWindowResult, isLateRisk } from './deliveries'

describe('getDeliveryState', () => {
  it('tells delivered, part delivered, skipped and pending apart', () => {
    expect(
      getDeliveryState({ status: 'completed', acceptedInFull: true })
    ).toBe('delivered')
    expect(
      getDeliveryState({ status: 'completed', acceptedInFull: false })
    ).toBe('part_delivered')
    expect(getDeliveryState({ status: 'skipped', acceptedInFull: null })).toBe(
      'skipped'
    )
    expect(getDeliveryState({ status: 'pending', acceptedInFull: null })).toBe(
      'pending'
    )
  })
})

describe('getWindowResult', () => {
  it('compares the actual arrival with the time window', () => {
    expect(
      getWindowResult(makeDelivery({ actualArrival: ukTime('07:50') }))
    ).toBe('early')
    expect(
      getWindowResult(makeDelivery({ actualArrival: ukTime('08:07') }))
    ).toBe('on_time')
    expect(
      getWindowResult(makeDelivery({ actualArrival: ukTime('13:01') }))
    ).toBe('late')
  })

  it('falls back to the ETA, and has no result without either', () => {
    expect(getWindowResult(makeDelivery({ eta: ukTime('13:30') }))).toBe('late')
    expect(getWindowResult(makeDelivery())).toBeNull()
  })
})

describe('isLateRisk', () => {
  it('flags stops not reached yet that are expected after the window', () => {
    expect(isLateRisk(makeDelivery({ eta: ukTime('13:30') }))).toBe(true)
    expect(isLateRisk(makeDelivery({ eta: ukTime('12:30') }))).toBe(false)
    expect(
      isLateRisk(
        makeDelivery({ eta: ukTime('13:30'), actualArrival: ukTime('13:10') })
      )
    ).toBe(false)
  })
})
