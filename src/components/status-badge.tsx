import { type StatusMeta } from '@/config/statuses'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type StatusProps = { status: StatusMeta; className?: string }

export function StatusDot({ status, className }: StatusProps) {
  return (
    <span
      aria-hidden
      className={cn('inline-block size-2.5 shrink-0 rounded-full', className)}
      style={{ backgroundColor: status.color }}
    />
  )
}

export function StatusBadge({ status, className }: StatusProps) {
  return (
    <Badge
      variant='outline'
      className={cn('font-semibold', className)}
      style={{
        color: status.color,
        borderColor: `${status.color}66`,
        backgroundColor: `${status.color}14`,
      }}
    >
      {status.label}
    </Badge>
  )
}
