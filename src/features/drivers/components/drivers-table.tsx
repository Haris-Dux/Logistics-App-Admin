import { useMemo } from 'react'
import { activeStatuses, toFilterOptions } from '@/config/statuses'
import { type Depot } from '@/api/depots'
import { type Driver } from '@/api/drivers'
import { useDataTable } from '@/hooks/use-data-table'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/data-table'
import { driversColumns } from './drivers-columns'

type DriversTableProps = {
  data: Driver[]
  depots: Depot[]
  isLoading: boolean
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function DriversTable({
  data,
  depots,
  isLoading,
  search,
  navigate,
}: DriversTableProps) {
  const columns = useMemo(() => driversColumns(depots), [depots])
  const table = useDataTable({
    data,
    columns,
    search,
    navigate,
    columnFilters: [
      { columnId: 'name', searchKey: 'name', type: 'string' },
      { columnId: 'status', searchKey: 'status', type: 'array' },
    ],
  })

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter drivers...'
        searchKey='name'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: toFilterOptions(activeStatuses),
          },
        ]}
      />
      <DataTable table={table} isLoading={isLoading} />
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}
