import { Link } from '@tanstack/react-router'
import { alertTypes } from '@/config/statuses'
import { type Alert } from '@/api/alerts'
import { alertLink } from '@/lib/alerts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/status-badge'

const MAX_ITEMS = 6

type NeedsAttentionProps = { alerts?: Alert[] }

export function NeedsAttention({ alerts }: NeedsAttentionProps) {
  return (
    <Card className='gap-3'>
      <CardHeader className='flex items-center justify-between'>
        <CardTitle>Needs attention</CardTitle>
        <Link
          to='/alerts'
          className='text-sm font-medium text-primary hover:underline'
        >
          All alerts →
        </Link>
      </CardHeader>
      <CardContent>
        {!alerts && <Skeleton className='h-40 w-full' />}
        {alerts?.length === 0 && (
          <p className='py-6 text-center text-sm text-muted-foreground'>
            Nothing needs attention right now.
          </p>
        )}
        <ul className='divide-y'>
          {alerts?.slice(0, MAX_ITEMS).map((alert) => (
            <li key={alert.id}>
              <Link
                {...alertLink(alert)}
                className='flex items-center gap-3 py-2 text-sm hover:bg-accent'
              >
                <StatusBadge
                  status={alertTypes[alert.type]}
                  className='w-24 justify-center'
                />
                <span className='min-w-0 truncate'>
                  {alert.vehicle && (
                    <span className='font-semibold'>
                      {alert.vehicle.registration}{' '}
                    </span>
                  )}
                  {alert.message}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
