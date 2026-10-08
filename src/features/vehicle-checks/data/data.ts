import { type StatusMeta, statusColors } from '@/config/statuses'
import { type VehicleCheck } from '@/api/vehicle-checks'

export type CheckResult = 'pass' | 'defect'

export const checkResults: Record<CheckResult, StatusMeta> = {
  pass: { label: 'Pass', color: statusColors.green },
  defect: { label: 'Defect', color: statusColors.red },
}

export const getCheckResult = (check: VehicleCheck): CheckResult =>
  check.defectStatus === 'none' ? 'pass' : 'defect'

/** Badge for a check: pass, open defects (with count) or repaired. */
export function checkBadge(check: VehicleCheck): StatusMeta {
  if (check.defectStatus === 'repaired') {
    return { label: 'Repaired', color: statusColors.green }
  }
  if (check.defectStatus === 'open') {
    const defects = check.items.filter((item) => !item.passed).length
    return {
      label: `${defects} defect${defects > 1 ? 's' : ''}`,
      color: checkResults.defect.color,
    }
  }
  return checkResults.pass
}
