import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { activityLogQueryOptions } from '@/api/activity-log'
import { recentDays } from '@/lib/dates'
import { DateRangePicker } from '@/components/date-range-picker'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { PageTitle } from '@/components/layout/page-title'
import { ActivityLogTable } from './components/activity-log-table'

const route = getRouteApi('/_authenticated/activity-log/')

/** The log opens on the last seven days. */
const DEFAULT_DAYS = 7

export function ActivityLog() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const defaults = recentDays(DEFAULT_DAYS)
  const range = {
    from: search.from ?? defaults.from,
    to: search.to ?? defaults.to,
  }
  const { data = [], isLoading } = useQuery(activityLogQueryOptions(range))

  return (
    <>
      <AppHeader fixed />
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageTitle
          title='Activity log'
          description='What admins have changed, and when.'
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
        <ActivityLogTable
          data={data}
          isLoading={isLoading}
          search={search}
          navigate={navigate}
        />
      </Main>
    </>
  )
}
