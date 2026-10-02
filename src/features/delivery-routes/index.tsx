import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { notStartedStatus, shiftStatuses } from '@/config/statuses'
import { deliveryRoutesQueryOptions } from '@/api/delivery-routes'
import { depotsQueryOptions } from '@/api/depots'
import { useDepotId } from '@/stores/depot-store'
import { todayParam } from '@/lib/dates'
import { useFleetDay } from '@/hooks/use-fleet-day'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DatePicker } from '@/components/date-picker'
import { DeliveryProgress } from '@/components/delivery-progress'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { PageTitle } from '@/components/layout/page-title'
import { StatusBadge } from '@/components/status-badge'

const route = getRouteApi('/_authenticated/routes/')

export function DeliveryRoutes() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const date = search.date ?? todayParam()
  const depotId = useDepotId()
  const { data: routes, isLoading } = useQuery(
    deliveryRoutesQueryOptions({ depotId })
  )
  const { data: depots = [] } = useQuery(depotsQueryOptions())
  const { vans } = useFleetDay(date)

  return (
    <>
      <AppHeader fixed />
      <Main className='flex flex-col gap-4 sm:gap-6'>
        <PageTitle
          title='Routes'
          description='Who is driving which vehicle on each route, and how far they have got.'
        >
          <DatePicker
            value={date}
            onChange={(value) => navigate({ search: { date: value } })}
          />
        </PageTitle>
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Depot</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Trip</TableHead>
                <TableHead className='w-1/5'>Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Skeleton className='h-24 w-full' />
                  </TableCell>
                </TableRow>
              )}
              {routes?.map((deliveryRoute) => {
                const van = vans.find(
                  ({ shift }) => shift.routeNumber === deliveryRoute.routeNumber
                )
                return (
                  <TableRow
                    key={deliveryRoute.id}
                    className={van && 'cursor-pointer'}
                    onClick={
                      van &&
                      (() =>
                        navigate({
                          to: '/live-map',
                          search: {
                            vehicle: van.shift.vehicleId,
                            date: search.date,
                          },
                        }))
                    }
                  >
                    <TableCell>
                      <p className='font-semibold'>
                        Route {deliveryRoute.routeNumber}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {deliveryRoute.name}
                      </p>
                    </TableCell>
                    <TableCell>
                      {
                        depots.find(
                          (depot) => depot.id === deliveryRoute.depotId
                        )?.name
                      }
                    </TableCell>
                    <TableCell>
                      {van?.shift.vehicle.registration ?? '—'}
                    </TableCell>
                    <TableCell>{van?.shift.driver.name ?? '—'}</TableCell>
                    <TableCell>
                      {van?.currentTrip
                        ? `${van.currentTrip.tripNumber} of ${van.shift.trips.length}`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {van && (
                        <div className='flex items-center gap-2'>
                          <DeliveryProgress
                            done={van.delivered}
                            total={van.stops.length}
                          />
                          <span className='text-sm tabular-nums'>
                            {van.delivered}/{van.stops.length}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={
                          van
                            ? shiftStatuses[van.shift.status]
                            : notStartedStatus
                        }
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </Main>
    </>
  )
}
