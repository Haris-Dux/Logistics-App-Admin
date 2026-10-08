import { type Delivery } from '@/api/deliveries'
import { atTimeOfDay } from './dates'

export type DeliveryState =
  | 'pending'
  | 'delivered'
  | 'part_delivered'
  | 'skipped'

export function getDeliveryState({
  status,
  acceptedInFull,
}: Pick<Delivery, 'status' | 'acceptedInFull'>): DeliveryState {
  if (status === 'skipped') return 'skipped'
  if (status === 'completed') {
    return acceptedInFull === false ? 'part_delivered' : 'delivered'
  }
  return 'pending'
}

export type WindowResult = 'early' | 'on_time' | 'late'

type TimedDelivery = Pick<
  Delivery,
  'dispatchDate' | 'timeWindow' | 'actualArrival' | 'eta'
>

/** Actual (or expected) arrival measured against the customer's time window. */
export function getWindowResult({
  dispatchDate,
  timeWindow: [start, end],
  actualArrival,
  eta,
}: TimedDelivery): WindowResult | null {
  const arrival = actualArrival ?? eta
  if (!arrival) return null
  if (arrival < atTimeOfDay(dispatchDate, start)) return 'early'
  if (arrival > atTimeOfDay(dispatchDate, end)) return 'late'
  return 'on_time'
}

/** Still to be reached and expected after the window closes. */
export const isLateRisk = (delivery: Delivery) =>
  delivery.status === 'pending' &&
  !delivery.actualArrival &&
  getWindowResult(delivery) === 'late'
