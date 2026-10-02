import { type ColumnDef } from '@tanstack/react-table'
import { alertTypes } from '@/config/statuses'
import { type Alert } from '@/api/alerts'
import { formatDateTime } from '@/lib/format'
import { facetFilter } from '@/hooks/use-data-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { StatusBadge } from '@/components/status-badge'

export const alertsColumns: ColumnDef<Alert>[] = [
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Time' />
    ),
    cell: ({ row }) => formatDateTime(row.original.createdAt),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => <StatusBadge status={alertTypes[row.original.type]} />,
    filterFn: facetFilter,
  },
  {
    id: 'vehicle',
    accessorFn: (alert) => alert.vehicle?.registration ?? '',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vehicle' />
    ),
    cell: ({ getValue }) => (
      <span className='font-semibold'>{getValue<string>() || '—'}</span>
    ),
  },
  {
    id: 'driver',
    accessorFn: (alert) => alert.driver?.name ?? '',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Driver' />
    ),
  },
  {
    accessorKey: 'message',
    header: 'Details',
    cell: ({ row }) => (
      <LongText className='max-w-80'>{row.original.message}</LongText>
    ),
  },
]
