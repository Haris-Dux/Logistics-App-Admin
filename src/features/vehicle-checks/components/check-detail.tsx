import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { checkTypeLabels, vehicleStatuses } from '@/config/statuses'
import { CircleCheck, CircleX } from 'lucide-react'
import { toast } from 'sonner'
import { type VehicleCheck } from '@/api/vehicle-checks'
import { updateVehicleStatus } from '@/api/vehicles'
import { formatDateTime, formatTime } from '@/lib/format'
import useDialogState from '@/hooks/use-dialog-state'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { StatusBadge } from '@/components/status-badge'
import { RecordRepairDialog } from './record-repair-dialog'

export function CheckDetail({ check }: { check: VehicleCheck }) {
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useDialogState<'off-road' | 'repair'>()
  const [photo, setPhoto] = useState<string>()
  const { vehicle } = check

  const markOffRoad = useMutation({
    mutationFn: () => updateVehicleStatus(check.vehicleId, 'MAINTENANCE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-checks'] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success(`${vehicle.registration} marked off road.`)
      setDialog(null)
    },
  })

  return (
    <aside className='flex flex-col gap-4 rounded-md border p-4 lg:w-96'>
      <div className='flex flex-wrap items-center gap-2'>
        <h3 className='text-lg font-semibold'>
          {vehicle.registration} · {formatTime(check.checkedAt)} ·{' '}
          {check.driver.name}
        </h3>
        <StatusBadge status={vehicleStatuses[vehicle.status]} />
      </div>

      <ul className='divide-y'>
        {check.items.map((item) => (
          <li key={item.type} className='flex gap-3 py-2'>
            {item.passed ? (
              <CircleCheck className='size-5 shrink-0 text-green-600' />
            ) : (
              <CircleX className='size-5 shrink-0 text-red-600' />
            )}
            <div className='space-y-2'>
              <p>{checkTypeLabels[item.type]}</p>
              {item.notes && (
                <p className='text-sm text-red-600'>“{item.notes}”</p>
              )}
              {item.photos.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {item.photos.map((src) => (
                    <button
                      key={src}
                      type='button'
                      onClick={() => setPhoto(src)}
                    >
                      <img
                        src={src}
                        alt={`${checkTypeLabels[item.type]} photo`}
                        className='size-20 rounded-md border object-cover'
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {check.repair && (
        <p className='rounded-md border border-dashed p-3 text-sm'>
          <span className='font-semibold'>
            Repaired {formatDateTime(check.repair.repairedAt)} by{' '}
            {check.repair.recordedBy}:
          </span>{' '}
          {check.repair.notes}
        </p>
      )}

      {check.defectStatus === 'open' && (
        <div className='flex flex-wrap gap-2'>
          {vehicle.status === 'ACTIVE' && (
            <Button variant='destructive' onClick={() => setDialog('off-road')}>
              Mark vehicle off road
            </Button>
          )}
          <Button variant='outline' onClick={() => setDialog('repair')}>
            Record repair
          </Button>
        </div>
      )}
      <p className='text-xs text-muted-foreground'>
        Defect records are kept for DVSA inspection.
      </p>

      <ConfirmDialog
        open={dialog === 'off-road'}
        onOpenChange={() => setDialog('off-road')}
        title='Mark vehicle off road'
        desc={`${vehicle.registration} will be unavailable to drivers until a repair is recorded.`}
        confirmText='Mark off road'
        destructive
        isLoading={markOffRoad.isPending}
        handleConfirm={() => markOffRoad.mutate()}
      />
      <RecordRepairDialog
        check={check}
        open={dialog === 'repair'}
        onOpenChange={() => setDialog('repair')}
      />
      <Dialog open={!!photo} onOpenChange={() => setPhoto(undefined)}>
        <DialogContent className='sm:max-w-2xl'>
          <DialogTitle>Defect photo</DialogTitle>
          {photo && (
            <img src={photo} alt='Defect photo' className='w-full rounded-md' />
          )}
        </DialogContent>
      </Dialog>
    </aside>
  )
}
