import { useQuery } from '@tanstack/react-query'
import { Link, getRouteApi } from '@tanstack/react-router'
import { deliveryStates } from '@/config/statuses'
import { ChevronRight } from 'lucide-react'
import { deliveryQueryOptions } from '@/api/deliveries'
import { getDeliveryState } from '@/lib/deliveries'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Main } from '@/components/layout/main'
import { StatusBadge } from '@/components/status-badge'
import { InvoicesCard } from './invoices-card'
import { ProofOfDeliveryCard } from './proof-of-delivery-card'
import { TimingCard } from './timing-card'

const route = getRouteApi('/_authenticated/deliveries/$deliveryId')

export function DeliveryDetail() {
  const { deliveryId } = route.useParams()
  const { data: delivery } = useQuery(deliveryQueryOptions(deliveryId))

  return (
    <>
      <Main className='flex flex-col gap-4 sm:gap-6'>
        {!delivery ? (
          <Skeleton className='h-96 w-full' />
        ) : (
          <>
            <nav className='flex items-center gap-1 text-sm text-muted-foreground'>
              <Link
                to='/deliveries'
                search={{
                  from: delivery.dispatchDate,
                  to: delivery.dispatchDate,
                }}
                className='hover:text-foreground'
              >
                Deliveries
              </Link>
              <ChevronRight className='size-4' />
              <span>Route {delivery.routeNumber}</span>
              <ChevronRight className='size-4' />
              <span className='text-foreground'>Stop {delivery.sequence}</span>
            </nav>

            <Card>
              <CardContent className='flex flex-wrap items-start justify-between gap-4'>
                <div>
                  <h2 className='text-2xl font-bold tracking-tight'>
                    {delivery.customerName}
                  </h2>
                  <p className='text-muted-foreground'>
                    {delivery.deliveryAddress} · Customer ref{' '}
                    {delivery.customerId}
                  </p>
                </div>
                <div className='space-y-1 text-end text-sm'>
                  <StatusBadge
                    status={deliveryStates[getDeliveryState(delivery)]}
                  />
                  {delivery.acceptedInFull !== null && (
                    <p>
                      Accepted in full:{' '}
                      <span className='font-semibold'>
                        {delivery.acceptedInFull ? 'Yes' : 'No'}
                      </span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className='grid gap-4 lg:grid-cols-3'>
              <TimingCard delivery={delivery} />
              <InvoicesCard delivery={delivery} />
              <ProofOfDeliveryCard delivery={delivery} />
            </div>
          </>
        )}
      </Main>
    </>
  )
}
