import { useNavigate } from '@tanstack/react-router'
import { alertTypes, toFilterOptions } from '@/config/statuses'
import { type Alert } from '@/api/alerts'
import { alertLink } from '@/lib/alerts'
import { useDataTable } from '@/hooks/use-data-table'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/data-table'
import { alertsColumns } from './alerts-columns'

type AlertsTableProps = {
  data: Alert[]
  isLoading: boolean
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function AlertsTable({
  data,
  isLoading,
  search,
  navigate,
}: AlertsTableProps) {
  const navigateTo = useNavigate()
  const table = useDataTable({
    data,
    columns: alertsColumns,
    search,
    navigate,
    columnFilters: [
      { columnId: 'vehicle', searchKey: 'vehicle', type: 'string' },
      { columnId: 'type', searchKey: 'type', type: 'array' },
    ],
  })

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter vehicles...'
        searchKey='vehicle'
        filters={[
          {
            columnId: 'type',
            title: 'Type',
            options: toFilterOptions(alertTypes),
          },
        ]}
      />
      <DataTable
        table={table}
        isLoading={isLoading}
        onRowClick={(alert) => navigateTo(alertLink(alert))}
      />
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}
