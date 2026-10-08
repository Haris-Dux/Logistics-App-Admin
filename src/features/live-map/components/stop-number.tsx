import { type StopState, stopStates } from '@/config/statuses'
import { cn } from '@/lib/utils'

type StopNumberProps = {
  sequence: number
  state: StopState
  className?: string
}

/** Numbered stop dot, coloured like the stop markers on the map. */
export function StopNumber({ sequence, state, className }: StopNumberProps) {
  const pending = state === 'pending'
  return (
    <span
      className={cn(
        'inline-flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
        pending
          ? 'border-foreground text-foreground'
          : 'border-transparent text-white',
        className
      )}
      style={pending ? undefined : { backgroundColor: stopStates[state].color }}
    >
      {sequence}
    </span>
  )
}
