import { useCallback } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { todayParam } from '@/lib/dates'
import { useFleetDay } from '@/hooks/use-fleet-day'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { FleetWorkspace } from './components/fleet-workspace'
import { VanList } from './components/van-list'

const route = getRouteApi('/_authenticated/live-map/')

export function LiveMap() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const date = search.date ?? todayParam()
  const { vans, isLoading } = useFleetDay(date)
  const selectedVan = vans.find((van) => van.shift.vehicleId === search.vehicle)

  const selectVehicle = useCallback(
    (vehicle: string) => navigate({ search: (prev) => ({ ...prev, vehicle }) }),
    [navigate]
  )

  return (
    <>
      <AppHeader />
      <Main
        fixed
        fluid
        className='flex flex-col gap-4 max-lg:overflow-y-auto lg:flex-row'
      >
        <VanList
          vans={vans}
          isLoading={isLoading}
          selectedVehicleId={search.vehicle}
          onSelect={selectVehicle}
          date={date}
          onDateChange={(day) => navigate({ search: { date: day } })}
        />
        <FleetWorkspace
          vans={vans}
          selectedVan={selectedVan}
          date={date}
          onSelect={selectVehicle}
        />
      </Main>
    </>
  )
}
