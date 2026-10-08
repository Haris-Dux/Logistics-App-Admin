import { useCallback, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { type FleetVan } from '@/lib/fleet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapFitBounds } from '@/components/map/map-camera'
import { MapView } from '@/components/map/map-view'
import {
  type VanMarker,
  VanMarkersLayer,
} from '@/components/map/van-markers-layer'

export function LiveMapPreview({ vans }: { vans: FleetVan[] }) {
  const navigate = useNavigate()
  const markers = useMemo<VanMarker[]>(
    () =>
      vans.flatMap(({ shift, position }) =>
        position
          ? {
              vehicleId: shift.vehicleId,
              lat: position.lat,
              lng: position.lng,
              status: shift.status,
              label: shift.vehicle.registration,
              selected: false,
            }
          : []
      ),
    [vans]
  )
  const openVan = useCallback(
    (vehicle: string) => navigate({ to: '/live-map', search: { vehicle } }),
    [navigate]
  )

  return (
    <Card className='h-full w-full gap-3'>
      <CardHeader className='flex items-center justify-between'>
        <CardTitle>Live map</CardTitle>
        <Link
          to='/live-map'
          className='text-sm font-medium text-primary hover:underline'
        >
          Open full map →
        </Link>
      </CardHeader>
      <CardContent>
        <div className='h-80 overflow-hidden rounded-md border'>
          <MapView>
            <VanMarkersLayer vans={markers} onSelect={openVan} />
            <MapFitBounds
              key={vans.map((van) => van.shift.id).join()}
              points={markers}
            />
          </MapView>
        </div>
      </CardContent>
    </Card>
  )
}
