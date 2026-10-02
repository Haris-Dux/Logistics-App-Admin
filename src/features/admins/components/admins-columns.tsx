import { type ColumnDef } from '@tanstack/react-table'
import { activeStatuses } from '@/config/statuses'
import { type Admin } from '@/api/admins'
import { type Depot } from '@/api/depots'
import { formatDateTime } from '@/lib/format'
import { facetFilter } from '@/hooks/use-data-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { StatusBadge } from '@/components/status-badge'
import { DataTableRowActions } from './data-table-row-actions'

export const adminsColumns = (depots: Depot[]): ColumnDef<Admin>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => <span className='font-medium'>{row.original.name}</span>,
    enableHiding: false,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
  },
  {
    accessorKey: 'username',
    header: 'Username',
  },
  {
    accessorKey: 'depotId',
    header: 'Access',
    cell: ({ row }) =>
      depots.find((depot) => depot.id === row.original.depotId)?.name ??
      'Head office (all depots)',
  },
  {
    id: 'status',
    accessorFn: (admin) => (admin.active ? 'active' : 'inactive'),
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge
        status={activeStatuses[row.original.active ? 'active' : 'inactive']}
      />
    ),
    filterFn: facetFilter,
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
