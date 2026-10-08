import { type ColumnDef } from '@tanstack/react-table'
import { vehicleStatuses } from '@/config/statuses'
import { type Depot } from '@/api/depots'
import { type Driver } from '@/api/drivers'
import { type Vehicle } from '@/api/vehicles'
import { formatTime } from '@/lib/format'
import { facetFilter } from '@/hooks/use-data-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { StatusBadge } from '@/components/status-badge'
import { availabilities, getAvailability } from '../data/data'

export const vehiclesColumns = (
  depots: Depot[],
  drivers: Driver[]
): ColumnDef<Vehicle>[] => [
  {
    accessorKey: 'registration',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Registration' />
    ),
    cell: ({ row }) => (
      <span className='font-semibold'>{row.original.registration}</span>
    ),
    enableHiding: false,
  },
  {
    id: 'model',
    header: 'Make & model',
    cell: ({ row }) =>
      [row.original.make, row.original.model].filter(Boolean).join(' ') || '—',
  },
  {
    accessorKey: 'depotId',
    header: 'Depot',
    cell: ({ row }) =>
      depots.find((depot) => depot.id === row.original.depotId)?.name,
  },
  {
    accessorKey: 'routeNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Route' />
    ),
    cell: ({ row }) =>
      row.original.routeNumber ? `Route ${row.original.routeNumber}` : '—',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={vehicleStatuses[row.original.status]} />
    ),
    filterFn: facetFilter,
  },
  {
    id: 'availability',
    accessorFn: getAvailability,
    header: 'Availability',
    cell: ({ row }) => {
      const vehicle = row.original
      const driver = drivers.find((item) => item.id === vehicle.selectedById)
      return (
        <div className='flex items-center gap-2'>
          <StatusBadge status={availabilities[getAvailability(vehicle)]} />
          {driver && vehicle.selectedAt && (
            <span className='text-sm text-muted-foreground'>
              {driver.name} since {formatTime(vehicle.selectedAt)}
            </span>
          )}
        </div>
      )
    },
    filterFn: facetFilter,
  },
]
