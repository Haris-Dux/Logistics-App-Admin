import { type ColumnDef } from '@tanstack/react-table'
import { type VehicleCheck } from '@/api/vehicle-checks'
import { formatTime } from '@/lib/format'
import { facetFilter } from '@/hooks/use-data-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { StatusBadge } from '@/components/status-badge'
import { checkBadge, getCheckResult } from '../data/data'

export const vehicleChecksColumns: ColumnDef<VehicleCheck>[] = [
  {
    id: 'vehicle',
    accessorFn: (check) => check.vehicle.registration,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vehicle' />
    ),
    cell: ({ getValue }) => (
      <span className='font-semibold'>{getValue<string>()}</span>
    ),
  },
  {
    id: 'driver',
    accessorFn: (check) => check.driver.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Driver' />
    ),
  },
  {
    accessorKey: 'checkedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Time' />
    ),
    cell: ({ row }) => formatTime(row.original.checkedAt),
  },
  {
    id: 'result',
    accessorFn: getCheckResult,
    header: 'Result',
    cell: ({ row }) => <StatusBadge status={checkBadge(row.original)} />,
    filterFn: facetFilter,
  },
]
