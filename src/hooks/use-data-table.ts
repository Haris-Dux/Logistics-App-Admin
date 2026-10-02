import { useEffect, useState } from 'react'
import {
  type ColumnDef,
  type Row,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { type NavigateFn, useTableUrlState } from './use-table-url-state'

type UseDataTableOptions<TData> = {
  data: TData[]
  // Columns hold mixed value types, as in TanStack's own examples
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[]
  /** Route search params and navigate, so filters and paging live in the URL. */
  search: Record<string, unknown>
  navigate: NavigateFn
  /** Column filters mirrored to search params (keys must be in the route schema). */
  columnFilters?: Parameters<typeof useTableUrlState>[0]['columnFilters']
  /** Search param holding a server-side search; the table itself does not filter on it. */
  serverSearchKey?: string
  initialSorting?: SortingState
}

/** Column filter for faceted (multi-select) filters. */
export function facetFilter<TData>(
  row: Row<TData>,
  columnId: string,
  values: string[]
) {
  return values.includes(row.getValue(columnId))
}

/** A client-side table whose filters and pagination are synced with the URL. */
export function useDataTable<TData>({
  data,
  columns,
  search,
  navigate,
  columnFilters: columnFilterConfig = [],
  serverSearchKey,
  initialSorting = [],
}: UseDataTableOptions<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const {
    columnFilters,
    onColumnFiltersChange,
    globalFilter,
    onGlobalFilterChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: {
      enabled: !!serverSearchKey,
      key: serverSearchKey,
      trim: false,
    },
    columnFilters: columnFilterConfig,
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    // The global search box drives a server-side query instead
    enableGlobalFilter: false,
    onPaginationChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  return table
}
