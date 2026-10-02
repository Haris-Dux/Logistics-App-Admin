import { type Activity } from '@/api/activity-log'
import { useDataTable } from '@/hooks/use-data-table'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/data-table'
import { activityLogColumns } from './activity-log-columns'

type ActivityLogTableProps = {
  data: Activity[]
  isLoading: boolean
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function ActivityLogTable({
  data,
  isLoading,
  search,
  navigate,
}: ActivityLogTableProps) {
  const table = useDataTable({
    data,
    columns: activityLogColumns,
    search,
    navigate,
    columnFilters: [
      { columnId: 'action', searchKey: 'action', type: 'string' },
    ],
  })

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter actions...'
        searchKey='action'
      />
      <DataTable table={table} isLoading={isLoading} />
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}
