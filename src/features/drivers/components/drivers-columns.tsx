import { type ColumnDef } from '@tanstack/react-table'
import { activeStatuses } from '@/config/statuses'
import { type Depot } from '@/api/depots'
import { type Driver } from '@/api/drivers'
import { formatDateTime } from '@/lib/format'
import { facetFilter } from '@/hooks/use-data-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { StatusBadge } from '@/components/status-badge'
import { DataTableRowActions } from './data-table-row-actions'

export const driversColumns = (depots: Depot[]): ColumnDef<Driver>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => <span className='font-medium'>{row.original.name}</span>,
    enableHiding: false,
  },
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Username' />
    ),
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'depotId',
    header: 'Depot',
    cell: ({ row }) =>
      depots.find((depot) => depot.id === row.original.depotId)?.name,
  },
  {
    id: 'status',
    accessorFn: (driver) => (driver.active ? 'active' : 'inactive'),
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge
        status={activeStatuses[row.original.active ? 'active' : 'inactive']}
      />
    ),
    filterFn: facetFilter,
  },
  {
    id: 'device',
    header: 'Signed in',
    cell: ({ row }) =>
      row.original.deviceId ? (
        <span title={row.original.deviceId}>On a device</span>
      ) : (
        <span className='text-muted-foreground'>No</span>
      ),
  },
  {
    accessorKey: 'lastLoginAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Last login' />
    ),
    cell: ({ row }) =>
      row.original.lastLoginAt ? formatDateTime(row.original.lastLoginAt) : '—',
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
