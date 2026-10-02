import { useState } from 'react'
import {
  type StopState,
  depotMarker,
  shiftStatuses,
  stopStates,
  trailColor,
} from '@/config/statuses'
import { ChevronDown, Truck } from 'lucide-react'
import { type ShiftStatus } from '@/api/shifts'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { StopNumber } from './stop-number'

/** Extra explanation after a van status, as in the design. */
const VAN_HINTS: Partial<Record<ShiftStatus, string>> = {
  idle: 'stopped too long',
  offline: 'shows last-seen time',
}

/** Example stop numbers, as in the design. */
const SAMPLE_STOPS: Record<StopState, number> = {
  delivered: 1,
  skipped: 5,
  next: 6,
  pending: 7,
}

const MARKER = 'flex size-5 shrink-0 items-center justify-center rounded-full'
const SWATCH = 'h-1 w-5 shrink-0 rounded-full'

function LegendSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className='space-y-1.5'>
      <p className='font-semibold tracking-wide text-muted-foreground uppercase'>
        {title}
      </p>
      <ul className='space-y-1.5'>{children}</ul>
    </div>
  )
}

function LegendRow({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <li className='flex items-center gap-2'>
      {icon}
      <span>{children}</span>
    </li>
  )
}

/** What the van markers, stop markers and trail on the live map mean. */
export function MapLegend() {
  // Starts closed: between the van list and details panel the map is narrow
  const [open, setOpen] = useState(false)

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className='absolute start-3 bottom-8 z-10 flex max-h-[calc(100%-5rem)] flex-col rounded-md border bg-background/95 text-xs shadow-md'
    >
      <CollapsibleTrigger className='flex w-full items-center justify-between gap-2 px-3 py-2 font-semibold'>
        Legend
        <ChevronDown
          className={cn('size-4 transition-transform', open && 'rotate-180')}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className='min-h-0 w-56 space-y-3 overflow-y-auto px-3 pb-3'>
        <LegendSection title='Van markers'>
          {(Object.keys(shiftStatuses) as ShiftStatus[]).map((status) => (
            <LegendRow
              key={status}
              icon={
                <span
                  className={MARKER}
                  style={{ backgroundColor: shiftStatuses[status].color }}
                >
                  <Truck className='size-3 text-white' />
                </span>
              }
            >
              {shiftStatuses[status].label}
              {VAN_HINTS[status] && (
                <span className='text-muted-foreground'>
                  {' '}
                  ({VAN_HINTS[status]})
                </span>
              )}
            </LegendRow>
          ))}
        </LegendSection>

        <LegendSection title='Stops (selected van)'>
          {(Object.keys(stopStates) as StopState[]).map((state) => (
            <LegendRow
              key={state}
              icon={
                <StopNumber
                  sequence={SAMPLE_STOPS[state]}
                  state={state}
                  className='size-5'
                />
              }
            >
              {stopStates[state].label}
            </LegendRow>
          ))}
          <LegendRow
            icon={
              <span
                className={cn(
                  MARKER,
                  'border-2 border-white font-bold text-white'
                )}
                style={{ backgroundColor: depotMarker.color }}
              >
                D
              </span>
            }
          >
            {depotMarker.label}
          </LegendRow>
        </LegendSection>

        <LegendSection title='Trail'>
          <LegendRow
            icon={
              <span
                className={SWATCH}
                style={{ backgroundColor: trailColor }}
              />
            }
          >
            Route driven (live)
          </LegendRow>
          <LegendRow
            icon={
              <span
                className={SWATCH}
                style={{
                  background: `repeating-linear-gradient(90deg, ${trailColor} 0 4px, transparent 4px 7px)`,
                }}
              />
            }
          >
            Filled in after signal loss
          </LegendRow>
        </LegendSection>
      </CollapsibleContent>
    </Collapsible>
  )
}
