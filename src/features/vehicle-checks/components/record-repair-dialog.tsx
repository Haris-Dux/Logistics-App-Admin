import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { type VehicleCheck, recordRepair } from '@/api/vehicle-checks'
import { updateVehicleStatus } from '@/api/vehicles'
import { useAuthStore } from '@/stores/auth-store'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { FormDialog } from '@/components/form-dialog'

const formSchema = z.object({
  notes: z.string().trim().min(1, 'Describe the repair.'),
})

type RecordRepairDialogProps = {
  check: VehicleCheck
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RecordRepairDialog({
  check,
  open,
  onOpenChange,
}: RecordRepairDialogProps) {
  const queryClient = useQueryClient()
  const adminName = useAuthStore((state) => state.auth.user?.name ?? '')
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { notes: '' },
  })
  const { mutate, isPending } = useMutation({
    mutationFn: async ({ notes }: z.infer<typeof formSchema>) => {
      await recordRepair(check.id, {
        repairedAt: new Date(),
        notes,
        recordedBy: adminName,
      })
      // A repaired vehicle goes back on the road
      if (check.vehicle.status === 'MAINTENANCE') {
        await updateVehicleStatus(check.vehicleId, 'ACTIVE')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-checks'] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success(`Repair recorded for ${check.vehicle.registration}.`)
      form.reset()
      onOpenChange(false)
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Record repair'
      description={`What was fixed on ${check.vehicle.registration}? The vehicle is put back on the road.`}
      formId='repair-form'
      submitLabel='Record repair'
      isPending={isPending}
    >
      <Form {...form}>
        <form
          id='repair-form'
          onSubmit={form.handleSubmit((values) => mutate(values))}
        >
          <FormField
            control={form.control}
            name='notes'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repair notes</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </FormDialog>
  )
}
