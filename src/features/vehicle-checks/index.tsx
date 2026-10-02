import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ClipboardCheck } from 'lucide-react'
import { vehicleChecksQueryOptions } from '@/api/vehicle-checks'
import { useDepotId } from '@/stores/depot-store'
import { todayParam } from '@/lib/dates'
import { DatePicker } from '@/components/date-picker'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { PageTitle } from '@/components/layout/page-title'
import { CheckDetail } from './components/check-detail'
import { VehicleChecksTable } from './components/vehicle-checks-table'

const route = getRouteApi('/_authenticated/vehicle-checks/')

export function VehicleChecks() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const depotId = useDepotId()
  const date = search.date ?? todayParam()
  const { data = [], isLoading } = useQuery(
    vehicleChecksQueryOptions({ date, depotId })
  )
  const selected = data.find((check) => check.id === search.check)

  return (
    <>
      <AppHeader fixed />
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageTitle
          title='Vehicle checks'
          description='Daily walk-round checks, defects and repairs.'
        >
          <DatePicker
            value={date}
            onChange={(value) => navigate({ search: { date: value } })}
          />
        </PageTitle>
        <div className='flex flex-1 flex-col gap-4 lg:flex-row lg:items-start'>
          <VehicleChecksTable
            data={data}
            isLoading={isLoading}
            selectedId={selected?.id}
            onSelect={(check) =>
              navigate({ search: (prev) => ({ ...prev, check: check.id }) })
            }
            search={search}
            navigate={navigate}
          />
          {selected ? (
            <CheckDetail key={selected.id} check={selected} />
          ) : (
            <aside className='flex flex-col items-center gap-2 rounded-md border p-8 text-center text-muted-foreground lg:w-96'>
              <ClipboardCheck className='size-10' />
              <p>Pick a check to see each item, photos and defects.</p>
            </aside>
          )}
        </div>
      </Main>
    </>
  )
}
