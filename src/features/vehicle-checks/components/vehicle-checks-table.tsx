import { toFilterOptions } from '@/config/statuses'
import { type VehicleCheck } from '@/api/vehicle-checks'
import { useDataTable } from '@/hooks/use-data-table'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/data-table'
import { checkResults } from '../data/data'
import { vehicleChecksColumns } from './vehicle-checks-columns'

type VehicleChecksTableProps = {
  data: VehicleCheck[]
  isLoading: boolean
  selectedId?: string
  onSelect: (check: VehicleCheck) => void
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function VehicleChecksTable({
  data,
  isLoading,
  selectedId,
  onSelect,
  search,
  navigate,
}: VehicleChecksTableProps) {
  const table = useDataTable({
    data,
    columns: vehicleChecksColumns,
    search,
    navigate,
    columnFilters: [
      { columnId: 'vehicle', searchKey: 'vehicle', type: 'string' },
      { columnId: 'result', searchKey: 'result', type: 'array' },
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
            columnId: 'result',
            title: 'Result',
            options: toFilterOptions(checkResults),
          },
        ]}
      />
      <DataTable
        table={table}
        isLoading={isLoading}
        onRowClick={onSelect}
        isRowSelected={(check) => check.id === selectedId}
      />
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}
