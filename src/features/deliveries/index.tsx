import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { deliveriesQueryOptions } from '@/api/deliveries'
import { useDepotId } from '@/stores/depot-store'
import { recentDays } from '@/lib/dates'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { DateRangePicker } from '@/components/date-range-picker'
import { Main } from '@/components/layout/main'
import { PageTitle } from '@/components/layout/page-title'
import { DeliveriesTable } from './components/deliveries-table'

const route = getRouteApi('/_authenticated/deliveries/')

export function Deliveries() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const depotId = useDepotId()
  const today = recentDays(1)
  const range = { from: search.from ?? today.from, to: search.to ?? today.to }
  const q = useDebouncedValue(search.q ?? '')
  const { data = [], isLoading } = useQuery(
    deliveriesQueryOptions({ ...range, depotId, q })
  )

  return (
    <>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageTitle
          title='Deliveries'
        >
          <DateRangePicker
            value={range}
            onChange={(value) =>
              navigate({
                search: (prev) => ({ ...prev, ...value, page: undefined }),
              })
            }
          />
        </PageTitle>
        <DeliveriesTable
          data={data}
          isLoading={isLoading}
          search={search}
          navigate={navigate}
        />
      </Main>
    </>
  )
}
