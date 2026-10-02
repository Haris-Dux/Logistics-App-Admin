import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { reportQueryOptions } from '@/api/reports'
import { useDepotId } from '@/stores/depot-store'
import { recentDays } from '@/lib/dates'
import { formatDuration, formatPercent } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DateRangePicker } from '@/components/date-range-picker'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { PageTitle } from '@/components/layout/page-title'
import { StatCard } from '@/components/stat-card'
import { ReportTable } from './components/report-table'

const route = getRouteApi('/_authenticated/reports/')

/** Reports default to the last seven days. */
const DEFAULT_DAYS = 7

export function Reports() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const depotId = useDepotId()
  const defaults = recentDays(DEFAULT_DAYS)
  const range = {
    from: search.from ?? defaults.from,
    to: search.to ?? defaults.to,
  }
  const { data: report } = useQuery(reportQueryOptions({ ...range, depotId }))

  return (
    <>
      <AppHeader fixed />
      <Main className='flex flex-col gap-4 sm:gap-6'>
        <PageTitle
          title='Reports'
          description='On-time performance, deliveries per driver and vehicle, planned vs actual miles and time.'
        >
          <DateRangePicker
            value={range}
            onChange={(value) =>
              navigate({ search: (prev) => ({ ...prev, ...value }) })
            }
          />
        </PageTitle>
        {!report ? (
          <Skeleton className='h-96 w-full' />
        ) : (
          <>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
              <StatCard
                title='On time'
                value={formatPercent(
                  report.totals.onTime,
                  report.totals.delivered
                )}
              />
              <StatCard
                title='Delivered'
                value={report.totals.delivered}
                total={report.totals.deliveries}
              />
              <StatCard title='Skipped' value={report.totals.skipped} />
              <StatCard
                title='Miles (actual / planned)'
                value={report.totals.actualMiles}
                total={report.totals.plannedMiles}
              />
              <StatCard
                title='Time (actual / planned)'
                value={formatDuration(report.totals.actualMinutes)}
                total={formatDuration(report.totals.plannedMinutes)}
              />
            </div>
            <Tabs
              value={search.view ?? 'driver'}
              onValueChange={(view) =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    view: view as 'driver' | 'vehicle',
                  }),
                })
              }
            >
              <TabsList>
                <TabsTrigger value='driver'>By driver</TabsTrigger>
                <TabsTrigger value='vehicle'>By vehicle</TabsTrigger>
              </TabsList>
              <TabsContent value='driver'>
                <ReportTable label='Driver' rows={report.byDriver} />
              </TabsContent>
              <TabsContent value='vehicle'>
                <ReportTable label='Vehicle' rows={report.byVehicle} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </Main>
    </>
  )
}
