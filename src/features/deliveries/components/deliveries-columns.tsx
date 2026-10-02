import { type ColumnDef } from '@tanstack/react-table'
import { deliveryStates, windowResults } from '@/config/statuses'
import { type Delivery } from '@/api/deliveries'
import { getDeliveryState, getWindowResult } from '@/lib/deliveries'
import { formatDay, formatTime } from '@/lib/format'
import { facetFilter } from '@/hooks/use-data-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { StatusBadge } from '@/components/status-badge'

/** Planned arrival, then the actual one (or the ETA while still on the way). */
function plannedVsActual({ arrival, actualArrival, eta }: Delivery) {
  if (actualArrival) return `${arrival} → ${formatTime(actualArrival)}`
  return (
    <span className='text-muted-foreground'>
      {arrival} → {eta ? `ETA ${formatTime(eta)}` : '—'}
    </span>
  )
}

export const deliveriesColumns: ColumnDef<Delivery>[] = [
  {
    accessorKey: 'dispatchDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ row }) => formatDay(row.original.dispatchDate),
  },
  {
    id: 'route',
    accessorKey: 'routeNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Route' />
    ),
    cell: ({ row }) =>
      `Route ${row.original.routeNumber} · Trip ${row.original.tripNumber}`,
    filterFn: facetFilter,
  },
  {
    accessorKey: 'sequence',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Stop' />
    ),
    cell: ({ row }) => row.original.sequence,
  },
  {
    accessorKey: 'customerName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
    cell: ({ row }) => (
      <div>
        <LongText className='max-w-56 font-medium'>
          {row.original.customerName}
        </LongText>
        <p className='text-xs text-muted-foreground'>{row.original.postcode}</p>
      </div>
    ),
  },
  {
    id: 'window',
    header: 'Window',
    cell: ({ row }) => row.original.timeWindow.join('–'),
  },
  {
    id: 'arrival',
    header: 'Planned → actual',
    cell: ({ row }) => plannedVsActual(row.original),
  },
  {
    id: 'result',
    accessorFn: (delivery) => getWindowResult(delivery),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Window result' />
    ),
    cell: ({ getValue }) => {
      const result = getValue<ReturnType<typeof getWindowResult>>()
      return result && <StatusBadge status={windowResults[result]} />
    },
    filterFn: facetFilter,
  },
  {
    id: 'state',
    accessorFn: getDeliveryState,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => (
      <StatusBadge status={deliveryStates[getDeliveryState(row.original)]} />
    ),
    filterFn: facetFilter,
  },
  {
    id: 'notes',
    header: 'Skip reason / shortages',
    cell: ({ row }) => (
      <LongText className='max-w-48 text-muted-foreground'>
        {row.original.skipReason ?? row.original.itemsNotInDelivery ?? ''}
      </LongText>
    ),
  },
]
