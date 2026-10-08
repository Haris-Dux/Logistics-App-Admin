import { useNavigate } from '@tanstack/react-router'
import {
  deliveryStates,
  toFilterOptions,
} from '@/config/statuses'
import { type Delivery } from '@/api/deliveries'
import { useDataTable } from '@/hooks/use-data-table'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/data-table'
import { deliveriesColumns } from './deliveries-columns'

type DeliveriesTableProps = {
  data: Delivery[]
  isLoading: boolean
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function DeliveriesTable({
  data,
  isLoading,
  search,
  navigate,
}: DeliveriesTableProps) {
  const navigateTo = useNavigate()
  const table = useDataTable({
    data,
    columns: deliveriesColumns,
    search,
    navigate,
    serverSearchKey: 'q',
    columnFilters: [
      { columnId: 'state', searchKey: 'state', type: 'array' },
      { columnId: 'result', searchKey: 'result', type: 'array' },
      { columnId: 'route', searchKey: 'route', type: 'array' },
    ],
  })
  const routes = [...new Set(data.map((delivery) => delivery.routeNumber))]

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Search customer, invoice or order...'
        filters={[
          {
            columnId: 'state',
            title: 'Status',
            options: toFilterOptions(deliveryStates),
          },
          {
            columnId: 'route',
            title: 'Route',
            options: routes.map((route) => ({
              value: route,
              label: `Route ${route}`,
            })),
          },
        ]}
      />
      <DataTable
        table={table}
        isLoading={isLoading}
        onRowClick={(delivery) =>
          navigateTo({
            to: '/deliveries/$deliveryId',
            params: { deliveryId: delivery.id },
          })
        }
      />
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}
