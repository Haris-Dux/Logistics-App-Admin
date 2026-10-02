import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

type DeliveryProgressProps = {
  done: number
  total: number
  className?: string
}

/** Green bar of stops completed out of the total. */
export function DeliveryProgress({
  done,
  total,
  className,
}: DeliveryProgressProps) {
  return (
    <Progress
      value={total ? (done / total) * 100 : 0}
      className={cn(
        '[&>[data-slot=progress-indicator]]:bg-green-600',
        className
      )}
    />
  )
}
