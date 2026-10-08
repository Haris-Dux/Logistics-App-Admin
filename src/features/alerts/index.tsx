import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { alertsQueryOptions } from '@/api/alerts'
import { useDepotId } from '@/stores/depot-store'
import { recentDays } from '@/lib/dates'
import { DateRangePicker } from '@/components/date-range-picker'
import { Main } from '@/components/layout/main'
import { PageTitle } from '@/components/layout/page-title'
import { AlertsTable } from './components/alerts-table'

const route = getRouteApi('/_authenticated/alerts/')

export function Alerts() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const depotId = useDepotId()
  const today = recentDays(1)
  const range = { from: search.from ?? today.from, to: search.to ?? today.to }
  const { data = [], isLoading } = useQuery(
    alertsQueryOptions({ ...range, depotId })
  )

  return (
    <>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageTitle
          title='Alerts'
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
        <AlertsTable
          data={data}
          isLoading={isLoading}
          search={search}
          navigate={navigate}
        />
      </Main>
    </>
  )
}
