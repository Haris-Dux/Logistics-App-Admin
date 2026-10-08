import { useState } from 'react'
import { shiftStatuses } from '@/config/statuses'
import { type ShiftStatus } from '@/api/shifts'
import { type FleetVan } from '@/lib/fleet'
import { formatAge } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useNow } from '@/hooks/use-now'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { DatePicker } from '@/components/date-picker'
import { StatusDot } from '@/components/status-badge'

type VanListProps = {
  vans: FleetVan[]
  isLoading: boolean
  selectedVehicleId?: string
  onSelect: (vehicleId: string) => void
  date: string
  onDateChange: (date: string) => void
}

export function VanList({
  vans,
  isLoading,
  selectedVehicleId,
  onSelect,
  date,
  onDateChange,
}: VanListProps) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ShiftStatus>()
  const now = useNow()

  const term = query.trim().toLowerCase()
  const visible = vans.filter(
    ({ shift }) =>
      (!status || shift.status === status) &&
      (shift.vehicle.registration.toLowerCase().includes(term) ||
        shift.driver.name.toLowerCase().includes(term))
  )
  const counts = (filter: ShiftStatus) =>
    vans.filter(({ shift }) => shift.status === filter).length

  return (
    <aside className='flex min-h-0 flex-col gap-3 max-lg:shrink-0 lg:w-72 xl:w-80'>
      <DatePicker value={date} onChange={onDateChange} />
      <Input
        placeholder='Search vehicle or driver'
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className='flex flex-wrap gap-1.5'>
        <Button
          size='sm'
          variant={status ? 'outline' : 'secondary'}
          className='rounded-full'
          onClick={() => setStatus(undefined)}
        >
          All {vans.length}
        </Button>
        {(Object.keys(shiftStatuses) as ShiftStatus[])
          .filter((key) => counts(key) > 0)
          .map((key) => (
            <Button
              key={key}
              size='sm'
              variant={status === key ? 'secondary' : 'outline'}
              className='rounded-full'
              onClick={() => setStatus(status === key ? undefined : key)}
            >
              <StatusDot status={shiftStatuses[key]} />
              {shiftStatuses[key].label} {counts(key)}
            </Button>
          ))}
      </div>
      <ScrollArea className='min-h-0 flex-1 max-lg:max-h-72'>
        <div className='flex flex-col gap-1.5 pe-3'>
          {isLoading &&
            Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className='h-15 w-full' />
            ))}
          {!isLoading && !visible.length && (
            <p className='py-6 text-center text-sm text-muted-foreground'>
              No vans on shift.
            </p>
          )}
          {visible.map((van) => {
            const { shift } = van
            return (
              <button
                key={shift.id}
                type='button'
                onClick={() => onSelect(shift.vehicleId)}
                className={cn(
                  'flex items-start gap-3 rounded-md border px-3 py-2 text-start text-sm transition-colors hover:bg-accent',
                  shift.vehicleId === selectedVehicleId &&
                    'border-primary bg-accent'
                )}
              >
                <StatusDot
                  status={shiftStatuses[shift.status]}
                  className='mt-1.5'
                />
                <div className='min-w-0 flex-1'>
                  <p className='truncate'>
                    <span className='font-semibold'>
                      {shift.vehicle.registration}
                    </span>{' '}
                    · {shift.driver.name}
                  </p>
                  <p className='text-muted-foreground'>
                    Route {shift.routeNumber} · {van.delivered}/
                    {van.stops.length}
                    {van.position &&
                      ` · ${formatAge(van.position.recordedAt, now)}`}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </aside>
  )
}
