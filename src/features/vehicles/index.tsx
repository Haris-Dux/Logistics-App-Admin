import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { depotsQueryOptions } from '@/api/depots'
import { driversQueryOptions } from '@/api/drivers'
import { vehiclesQueryOptions } from '@/api/vehicles'
import { useDepotId } from '@/stores/depot-store'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { PageTitle } from '@/components/layout/page-title'
import { VehiclesTable } from './components/vehicles-table'

const route = getRouteApi('/_authenticated/vehicles/')

export function Vehicles() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const depotId = useDepotId()
  const { data = [], isLoading } = useQuery(vehiclesQueryOptions({ depotId }))
  const { data: depots = [] } = useQuery(depotsQueryOptions())
  const { data: drivers = [] } = useQuery(driversQueryOptions({ depotId }))

  return (
    <>
      <AppHeader fixed />
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageTitle
          title='Vehicles'
          description='Every vehicle, whether it is on the road, and who is driving it.'
        />
        <VehiclesTable
          data={data}
          depots={depots}
          drivers={drivers}
          isLoading={isLoading}
          search={search}
          navigate={navigate}
        />
      </Main>
    </>
  )
}
