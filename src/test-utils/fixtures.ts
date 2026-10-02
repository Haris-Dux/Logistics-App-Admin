import { type Delivery } from '@/api/deliveries'
import { type Position } from '@/api/positions'
import { type Shift } from '@/api/shifts'
import { type Trip } from '@/api/trips'

/** An instant on 1 Oct 2026 in UK time (BST, UTC+1). */
export const ukTime = (time: string) => new Date(`2026-10-01T${time}:00+01:00`)

export function makeDelivery(overrides: Partial<Delivery> = {}): Delivery {
  return {
    id: 'delivery-1',
    tripId: 'trip-1',
    shiftId: 'shift-1',
    depotId: 'west-london',
    routeNumber: '33',
    dispatchDate: '2026-10-01',
    tripNumber: 1,
    sequence: 1,
    customerId: 'C-1',
    customerName: 'Corner Stores Ltd',
    deliveryAddress: '12 High Street',
    invoiceAddress: '12 High Street',
    postcode: 'HP9 1AA',
    area: 'Ealing',
    weight: 1000,
    deliveryMethod: 'handball',
    arrival: '08:00',
    departure: '08:20',
    timeWindow: ['08:00', '13:00'],
    outstanding: { cages: 0, pallets: 0, totes: 0 },
    invoices: [],
    location: { lat: 51.5, lng: -0.3 },
    status: 'pending',
    eta: null,
    actualArrival: null,
    actualDeparture: null,
    completedAt: null,
    skipReason: null,
    acceptedInFull: null,
    itemsNotInDelivery: null,
    notes: null,
    containers: null,
    pod: null,
    ...overrides,
  }
}

export function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: 'trip-1',
    shiftId: 'shift-1',
    routeNumber: '33',
    depotId: 'west-london',
    dispatchDate: '2026-10-01',
    tripNumber: 1,
    predictedMiles: 50,
    actualMiles: null,
    plannedStart: '07:00',
    plannedEnd: '12:00',
    startedAt: null,
    endedAt: null,
    status: 'DOWNLOADED',
    ...overrides,
  }
}

export function makeShift(overrides: Partial<Shift> = {}): Shift {
  return {
    id: 'shift-1',
    date: '2026-10-01',
    depotId: 'west-london',
    routeNumber: '33',
    driverId: 'driver-1',
    vehicleId: 'vehicle-1',
    status: 'driving',
    startedAt: ukTime('06:30'),
    endedAt: null,
    lastPosition: null,
    driver: { id: 'driver-1', name: 'Sam Taylor', phone: '07000 000000' },
    vehicle: { id: 'vehicle-1', registration: 'LX24VAN' },
    trips: [makeTrip()],
    ...overrides,
  }
}

export function makePosition(overrides: Partial<Position> = {}): Position {
  return {
    id: 'position-1',
    shiftId: 'shift-1',
    vehicleId: 'vehicle-1',
    lat: 51.5,
    lng: -0.3,
    speed: 0,
    course: 0,
    accuracy: 10,
    recordedAt: ukTime('08:00'),
    late: false,
    ...overrides,
  }
}
