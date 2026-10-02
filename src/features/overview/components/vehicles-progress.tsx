import { useNavigate } from '@tanstack/react-router'
import { shiftStatuses } from '@/config/statuses'
import { type FleetVan } from '@/lib/fleet'
import { formatAge } from '@/lib/format'
import { useNow } from '@/hooks/use-now'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeliveryProgress } from '@/components/delivery-progress'
import { StatusDot } from '@/components/status-badge'

export function VehiclesProgress({ vans }: { vans: FleetVan[] }) {
  const navigate = useNavigate()
  const now = useNow()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicles</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Route</TableHead>
              <TableHead className='w-1/4'>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last seen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vans.map(({ shift, stops, delivered, position }) => (
              <TableRow
                key={shift.id}
                className='cursor-pointer'
                onClick={() =>
                  navigate({
                    to: '/live-map',
                    search: { vehicle: shift.vehicleId },
                  })
                }
              >
                <TableCell className='font-semibold'>
                  {shift.vehicle.registration}
                </TableCell>
                <TableCell>{shift.driver.name}</TableCell>
                <TableCell>Route {shift.routeNumber}</TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <DeliveryProgress done={delivered} total={stops.length} />
                    <span className='text-sm tabular-nums'>
                      {delivered}/{stops.length}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className='flex items-center gap-2'>
                    <StatusDot status={shiftStatuses[shift.status]} />
                    {shiftStatuses[shift.status].label}
                  </span>
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {position
                    ? `${formatAge(position.recordedAt, now)} ago`
                    : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
