import { linkOptions } from '@tanstack/react-router'
import { type Alert } from '@/api/alerts'
import { operationsDay } from './dates'

/** Where to look into an alert: the check, the skipped stop, or the van. */
export function alertLink(alert: Alert) {
  const date = operationsDay(alert.createdAt)
  if (alert.vehicleCheckId) {
    return linkOptions({
      to: '/vehicle-checks',
      search: { date, check: alert.vehicleCheckId },
    })
  }
  if (alert.type === 'delivery_skipped' && alert.deliveryId) {
    return linkOptions({
      to: '/deliveries/$deliveryId',
      params: { deliveryId: alert.deliveryId },
    })
  }
  return linkOptions({
    to: '/live-map',
    search: { date, vehicle: alert.vehicleId ?? undefined },
  })
}
