import { differenceInMinutes } from 'date-fns'
import { queryOptions } from '@tanstack/react-query'
import { atTimeOfDay } from '@/lib/dates'
import { getWindowResult } from '@/lib/deliveries'
import { type DateRange, type DepotFilter } from './common'
import { type Delivery, getDeliveries } from './deliveries'
import { type Shift, getShifts } from './shifts'

export type ReportTotals = {
  trips: number
  deliveries: number
  delivered: number
  skipped: number
  /** Delivered no later than the end of the customer's window. */
  onTime: number
  plannedMiles: number
  actualMiles: number
  plannedMinutes: number
  actualMinutes: number
}

export type ReportRow = ReportTotals & { id: string; name: string }

type Report = {
  totals: ReportTotals
  byDriver: ReportRow[]
  byVehicle: ReportRow[]
}

const emptyTotals = (): ReportTotals => ({
  trips: 0,
  deliveries: 0,
  delivered: 0,
  skipped: 0,
  onTime: 0,
  plannedMiles: 0,
  actualMiles: 0,
  plannedMinutes: 0,
  actualMinutes: 0,
})

function shiftTotals(shift: Shift, deliveries: Delivery[]): ReportTotals {
  const totals = emptyTotals()
  // Only finished trips have actuals, so compare planned vs actual on those
  for (const trip of shift.trips) {
    if (!trip.startedAt || !trip.endedAt) continue
    totals.trips += 1
    totals.plannedMiles += trip.predictedMiles
    totals.actualMiles += trip.actualMiles ?? 0
    totals.plannedMinutes += differenceInMinutes(
      atTimeOfDay(trip.dispatchDate, trip.plannedEnd),
      atTimeOfDay(trip.dispatchDate, trip.plannedStart)
    )
    totals.actualMinutes += differenceInMinutes(trip.endedAt, trip.startedAt)
  }
  for (const delivery of deliveries) {
    totals.deliveries += 1
    if (delivery.status === 'skipped') totals.skipped += 1
    if (delivery.status !== 'completed') continue
    totals.delivered += 1
    if (getWindowResult(delivery) !== 'late') totals.onTime += 1
  }
  return totals
}

function add(target: ReportTotals, source: ReportTotals) {
  for (const key of Object.keys(source) as (keyof ReportTotals)[]) {
    target[key] += source[key]
  }
}

/** Aggregates shifts and their deliveries into totals per driver and vehicle. */
export function buildReport(shifts: Shift[], deliveries: Delivery[]): Report {
  const deliveriesByShift = new Map<string | null, Delivery[]>()
  for (const delivery of deliveries) {
    const group = deliveriesByShift.get(delivery.shiftId) ?? []
    group.push(delivery)
    deliveriesByShift.set(delivery.shiftId, group)
  }
  const totals = emptyTotals()
  const byDriver = new Map<string, ReportRow>()
  const byVehicle = new Map<string, ReportRow>()

  const addTo = (rows: Map<string, ReportRow>, id: string, name: string) => {
    const row = rows.get(id) ?? { id, name, ...emptyTotals() }
    rows.set(id, row)
    return row
  }

  for (const shift of shifts) {
    const result = shiftTotals(shift, deliveriesByShift.get(shift.id) ?? [])
    add(totals, result)
    add(addTo(byDriver, shift.driverId, shift.driver.name), result)
    add(addTo(byVehicle, shift.vehicleId, shift.vehicle.registration), result)
  }

  const byName = (a: ReportRow, b: ReportRow) => a.name.localeCompare(b.name)
  return {
    totals,
    byDriver: [...byDriver.values()].sort(byName),
    byVehicle: [...byVehicle.values()].sort(byName),
  }
}

export const reportQueryOptions = (filters: DateRange & DepotFilter) =>
  queryOptions({
    queryKey: ['reports', filters],
    queryFn: async () => {
      const [shifts, deliveries] = await Promise.all([
        getShifts(filters),
        getDeliveries(filters),
      ])
      return buildReport(shifts, deliveries)
    },
  })
