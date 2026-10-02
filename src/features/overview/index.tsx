import { useQuery } from '@tanstack/react-query'
import { deliveryStates, shiftStatuses } from '@/config/statuses'
import { alertsQueryOptions } from '@/api/alerts'
import { driversQueryOptions } from '@/api/drivers'
import { conversationsQueryOptions } from '@/api/messages'
import { vehiclesQueryOptions } from '@/api/vehicles'
import { useDepotId } from '@/stores/depot-store'
import { todayParam } from '@/lib/dates'
import { isLateRisk } from '@/lib/deliveries'
import { useFleetDay } from '@/hooks/use-fleet-day'
import { DeliveryProgress } from '@/components/delivery-progress'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { PageTitle } from '@/components/layout/page-title'
import { StatCard } from '@/components/stat-card'
import { LiveMapPreview } from './components/live-map-preview'
import { NeedsAttention } from './components/needs-attention'
import { VehiclesProgress } from './components/vehicles-progress'

export function Overview() {
  const today = todayParam()
  const depotId = useDepotId()
  const { vans, deliveries = [] } = useFleetDay(today)
  const { data: vehicles = [] } = useQuery(vehiclesQueryOptions({ depotId }))
  const { data: drivers = [] } = useQuery(driversQueryOptions({ depotId }))
  const { data: conversations = [] } = useQuery(conversationsQueryOptions())
  const { data: alerts } = useQuery(
    alertsQueryOptions({ from: today, to: today, depotId })
  )

  const vansOut = vans.filter(
    ({ shift }) => shift.status !== 'checks' && shift.status !== 'ended'
  ).length
  const delivered = deliveries.filter((d) => d.status === 'completed').length
  const skipped = deliveries.filter((d) => d.status === 'skipped').length
  const lateRisk = deliveries.filter(isLateRisk).length
  const depotDriverIds = new Set(drivers.map((driver) => driver.id))
  const unread = conversations
    .filter((conversation) => depotDriverIds.has(conversation.driverId))
    .reduce((sum, conversation) => sum + conversation.unreadIds.length, 0)

  return (
    <>
      <AppHeader />
      <Main className='flex flex-col gap-4 sm:gap-6'>
        <PageTitle title='Today at a glance' />
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
          <StatCard
            title='Vehicles out'
            value={vansOut}
            total={vehicles.filter((v) => v.status === 'ACTIVE').length}
          />
          <StatCard
            title='Delivered'
            value={delivered}
            total={deliveries.length}
          >
            <DeliveryProgress done={delivered} total={deliveries.length} />
          </StatCard>
          <StatCard
            title='Skipped'
            value={skipped}
            color={deliveryStates.skipped.color}
          />
          <StatCard
            title='Late risk'
            value={lateRisk}
            color={shiftStatuses.idle.color}
          />
          <StatCard
            title='Unread messages'
            value={unread}
            color={shiftStatuses.at_stop.color}
          />
        </div>
        <div className='grid gap-4 lg:grid-cols-5'>
          <div className='lg:col-span-3'>
            <LiveMapPreview vans={vans} />
          </div>
          <div className='lg:col-span-2'>
            <NeedsAttention alerts={alerts} />
          </div>
        </div>
        <VehiclesProgress vans={vans} />
      </Main>
    </>
  )
}
