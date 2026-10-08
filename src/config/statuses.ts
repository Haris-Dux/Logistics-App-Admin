import { type AlertType } from '@/api/alerts'
import { type ShiftStatus } from '@/api/shifts'
import { type CheckType } from '@/api/vehicle-checks'
import { type VehicleStatus } from '@/api/vehicles'
import { type DeliveryState, type WindowResult } from '@/lib/deliveries'

/** Display label plus a colour shared by badges, dots and map markers. */
export type StatusMeta = { label: string; color: string }

/** Status palette, shared with the map so markers match badges. */
export const statusColors = {
  green: '#16a34a',
  blue: '#2563eb',
  orange: '#ea580c',
  amber: '#d97706',
  red: '#dc2626',
  violet: '#7c3aed',
  slate: '#64748b',
  lightSlate: '#94a3b8',
}
const {
  green: GREEN,
  blue: BLUE,
  orange: ORANGE,
  amber: AMBER,
  red: RED,
  violet: VIOLET,
  slate: SLATE,
  lightSlate: LIGHT_SLATE,
} = statusColors

export const shiftStatuses: Record<ShiftStatus, StatusMeta> = {
  driving: { label: 'Driving', color: GREEN },
  at_stop: { label: 'At stop', color: BLUE },
  idle: { label: 'Idle', color: ORANGE },
  checks: { label: 'Doing checks', color: VIOLET },
  offline: { label: 'Offline', color: SLATE },
  ended: { label: 'Day ended', color: LIGHT_SLATE },
}

export const notStartedStatus: StatusMeta = {
  label: 'Not started',
  color: LIGHT_SLATE,
}

/** The depot marker on the map, also used to outline stops still to do. */
export const depotMarker: StatusMeta = { label: 'Depot', color: '#0f172a' }

/** The selected van's trail on the map. */
export const trailColor = BLUE

/** Stop markers on the map for the selected van. */
export type StopState = 'delivered' | 'skipped' | 'next' | 'pending'

export const stopStates: Record<StopState, StatusMeta> = {
  delivered: { label: 'Delivered', color: GREEN },
  skipped: { label: 'Skipped', color: RED },
  next: { label: 'Next stop', color: BLUE },
  pending: { label: 'Still to do', color: '#ffffff' },
}

export const deliveryStates: Record<DeliveryState, StatusMeta> = {
  pending: { label: 'Pending', color: SLATE },
  delivered: { label: 'Delivered', color: GREEN },
  part_delivered: { label: 'Part delivered', color: AMBER },
  skipped: { label: 'Skipped', color: RED },
}

export const windowResults: Record<WindowResult, StatusMeta> = {
  early: { label: 'Early', color: BLUE },
  on_time: { label: 'Within window', color: GREEN },
  late: { label: 'Late', color: RED },
}

export const alertTypes: Record<AlertType, StatusMeta> = {
  running_late: { label: 'Late', color: ORANGE },
  delivery_skipped: { label: 'Skipped', color: RED },
  no_gps: { label: 'No GPS', color: SLATE },
  defect_reported: { label: 'Defect', color: RED },
  upload_failed: { label: 'Upload failed', color: AMBER },
}

export const vehicleStatuses: Record<VehicleStatus, StatusMeta> = {
  ACTIVE: { label: 'Active', color: GREEN },
  MAINTENANCE: { label: 'Off road', color: RED },
  RETIRED: { label: 'Retired', color: SLATE },
}

export const activeStatuses: Record<'active' | 'inactive', StatusMeta> = {
  active: { label: 'Active', color: GREEN },
  inactive: { label: 'Inactive', color: SLATE },
}

export const checkTypeLabels: Record<CheckType, string> = {
  tyre_pressure: 'Tyre pressure',
  fuel_level: 'Fuel level',
  lights_indicators: 'Lights & indicators',
  mirrors_glass: 'Mirrors & glass',
  brakes: 'Brakes',
  fluid_levels: 'Oil & fluid levels',
  bodywork_doors: 'Bodywork & doors',
}

/** Options for data-table faceted filters. */
export const toFilterOptions = (statuses: Record<string, StatusMeta>) =>
  Object.entries(statuses).map(([value, { label }]) => ({ value, label }))
