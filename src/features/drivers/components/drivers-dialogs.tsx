import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { releaseDriverLogin, updateDriver } from '@/api/drivers'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DriverFormDialog } from './driver-form-dialog'
import { useDrivers } from './drivers-provider'
import { ResetPasswordDialog } from './reset-password-dialog'

export function DriversDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useDrivers()
  const queryClient = useQueryClient()
  const closeFor = (dialog: Parameters<typeof setOpen>[0]) => () => {
    setOpen(dialog)
    setTimeout(() => setCurrentRow(null), 500)
  }
  const onDone = (message: string) => {
    queryClient.invalidateQueries({ queryKey: ['drivers'] })
    toast.success(message)
    setOpen(null)
  }

  const releaseLogin = useMutation({
    mutationFn: releaseDriverLogin,
    onSuccess: () =>
      onDone('Login released. The driver can now sign in on another phone.'),
  })
  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateDriver(id, { active }),
    onSuccess: (_, { active }) =>
      onDone(active ? 'Driver activated.' : 'Driver deactivated.'),
  })

  return (
    <>
      <DriverFormDialog
        key='driver-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <DriverFormDialog
            key={`driver-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={closeFor('edit')}
            currentRow={currentRow}
          />

          <ResetPasswordDialog
            key={`driver-reset-${currentRow.id}`}
            open={open === 'reset-password'}
            onOpenChange={closeFor('reset-password')}
            currentRow={currentRow}
          />

          <ConfirmDialog
            open={open === 'release-login'}
            onOpenChange={closeFor('release-login')}
            title='Release login'
            desc={`${currentRow.name} is signed in on a phone that may be lost or no longer have the app. Releasing the login lets them sign in on another phone.`}
            confirmText='Release login'
            isLoading={releaseLogin.isPending}
            handleConfirm={() => releaseLogin.mutate(currentRow.id)}
          />

          <ConfirmDialog
            open={open === 'toggle-active'}
            onOpenChange={closeFor('toggle-active')}
            title={currentRow.active ? 'Deactivate driver' : 'Activate driver'}
            desc={
              currentRow.active
                ? `${currentRow.name} will no longer be able to sign in to the app.`
                : `${currentRow.name} will be able to sign in to the app again.`
            }
            confirmText={currentRow.active ? 'Deactivate' : 'Activate'}
            destructive={currentRow.active}
            isLoading={toggleActive.isPending}
            handleConfirm={() =>
              toggleActive.mutate({
                id: currentRow.id,
                active: !currentRow.active,
              })
            }
          />
        </>
      )}
    </>
  )
}
