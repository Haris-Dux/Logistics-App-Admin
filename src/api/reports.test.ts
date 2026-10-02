import {
  makeDelivery,
  makeShift,
  makeTrip,
  ukTime,
} from '@/test-utils/fixtures'
import { describe, expect, it } from 'vitest'
import { buildReport } from './reports'

describe('buildReport', () => {
  const finishedTrip = makeTrip({
    predictedMiles: 50,
    actualMiles: 54,
    plannedStart: '07:00',
    plannedEnd: '12:00',
    startedAt: ukTime('07:10'),
    endedAt: ukTime('12:40'),
    status: 'UPLOADED',
  })
  const shifts = [
    makeShift({ id: 's1', trips: [finishedTrip, makeTrip({ id: 'open' })] }),
    makeShift({
      id: 's2',
      driverId: 'driver-2',
      driver: { id: 'driver-2', name: 'Ana Moss', phone: '' },
      trips: [{ ...finishedTrip, id: 'trip-2', shiftId: 's2' }],
    }),
  ]
  const deliveries = [
    makeDelivery({
      shiftId: 's1',
      status: 'completed',
      actualArrival: ukTime('08:05'),
    }),
    makeDelivery({
      shiftId: 's1',
      status: 'completed',
      actualArrival: ukTime('13:30'),
    }),
    makeDelivery({ shiftId: 's1', status: 'skipped' }),
    makeDelivery({
      shiftId: 's2',
      status: 'completed',
      actualArrival: ukTime('09:00'),
    }),
  ]

  it('totals deliveries, on-time arrivals and finished trips', () => {
    const { totals } = buildReport(shifts, deliveries)

    expect(totals).toEqual({
      trips: 2,
      deliveries: 4,
      delivered: 3,
      skipped: 1,
      onTime: 2,
      plannedMiles: 100,
      actualMiles: 108,
      plannedMinutes: 600,
      actualMinutes: 660,
    })
  })

  it('groups rows by driver and by vehicle, sorted by name', () => {
    const { byDriver, byVehicle } = buildReport(shifts, deliveries)

    expect(byDriver.map((row) => [row.name, row.delivered])).toEqual([
      ['Ana Moss', 1],
      ['Sam Taylor', 2],
    ])
    expect(byVehicle).toHaveLength(1)
    expect(byVehicle[0]).toMatchObject({
      name: 'LX24VAN',
      deliveries: 4,
      trips: 2,
    })
  })
})
