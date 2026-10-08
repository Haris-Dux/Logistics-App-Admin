import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateAdmin } from '@/api/admins'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AdminFormDialog } from './admin-form-dialog'
import { useAdmins } from './admins-provider'

export function AdminsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAdmins()
  const queryClient = useQueryClient()
  const closeFor = (dialog: Parameters<typeof setOpen>[0]) => () => {
    setOpen(dialog)
    setTimeout(() => setCurrentRow(null), 500)
  }

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateAdmin(id, { active }),
    onSuccess: (_, { active }) => {
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      toast.success(active ? 'Admin activated.' : 'Admin deactivated.')
      setOpen(null)
    },
  })

  return (
    <>
      <AdminFormDialog
        key='admin-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <AdminFormDialog
            key={`admin-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={closeFor('edit')}
            currentRow={currentRow}
          />

          <ConfirmDialog
            open={open === 'toggle-active'}
            onOpenChange={closeFor('toggle-active')}
            title={currentRow.active ? 'Deactivate admin' : 'Activate admin'}
            desc={
              currentRow.active
                ? `${currentRow.name} will no longer be able to sign in to the portal.`
                : `${currentRow.name} will be able to sign in to the portal again.`
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
