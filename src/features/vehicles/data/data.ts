import { type StatusMeta, statusColors } from '@/config/statuses'
import { type Vehicle } from '@/api/vehicles'

export type Availability = 'available' | 'in_use' | 'unavailable'

export const availabilities: Record<Availability, StatusMeta> = {
  available: { label: 'Available', color: statusColors.green },
  in_use: { label: 'In use', color: statusColors.blue },
  unavailable: { label: 'Unavailable', color: statusColors.slate },
}

export function getAvailability(vehicle: Vehicle): Availability {
  if (vehicle.selectedById) return 'in_use'
  return vehicle.available && vehicle.status === 'ACTIVE'
    ? 'available'
    : 'unavailable'
}
