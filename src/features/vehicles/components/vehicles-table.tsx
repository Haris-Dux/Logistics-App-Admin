import { useMemo } from 'react'
import { toFilterOptions, vehicleStatuses } from '@/config/statuses'
import { type Depot } from '@/api/depots'
import { type Driver } from '@/api/drivers'
import { type Vehicle } from '@/api/vehicles'
import { useDataTable } from '@/hooks/use-data-table'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/data-table'
import { availabilities } from '../data/data'
import { vehiclesColumns } from './vehicles-columns'

type VehiclesTableProps = {
  data: Vehicle[]
  depots: Depot[]
  drivers: Driver[]
  isLoading: boolean
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function VehiclesTable({
  data,
  depots,
  drivers,
  isLoading,
  search,
  navigate,
}: VehiclesTableProps) {
  const columns = useMemo(
    () => vehiclesColumns(depots, drivers),
    [depots, drivers]
  )
  const table = useDataTable({
    data,
    columns,
    search,
    navigate,
    columnFilters: [
      { columnId: 'registration', searchKey: 'registration', type: 'string' },
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'availability', searchKey: 'availability', type: 'array' },
    ],
  })

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter registrations...'
        searchKey='registration'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: toFilterOptions(vehicleStatuses),
          },
          {
            columnId: 'availability',
            title: 'Availability',
            options: toFilterOptions(availabilities),
          },
        ]}
      />
      <DataTable table={table} isLoading={isLoading} />
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}
