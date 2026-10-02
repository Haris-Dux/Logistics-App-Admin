import { type ColumnDef } from '@tanstack/react-table'
import { type Activity } from '@/api/activity-log'
import { formatDateTime } from '@/lib/format'
import { DataTableColumnHeader } from '@/components/data-table'

export const activityLogColumns: ColumnDef<Activity>[] = [
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='When' />
    ),
    cell: ({ row }) => formatDateTime(row.original.createdAt),
  },
  {
    id: 'admin',
    accessorFn: (activity) => activity.admin.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Admin' />
    ),
    cell: ({ getValue }) => (
      <span className='font-medium'>{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'action',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Action' />
    ),
  },
  {
    accessorKey: 'target',
    header: 'Target',
  },
]
