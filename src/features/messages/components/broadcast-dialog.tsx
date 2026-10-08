import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { broadcastMessage } from '@/api/messages'
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
  body: z.string().trim().min(1, 'Please write a message.'),
})

type BroadcastDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  driverIds: string[]
}

export function BroadcastDialog({
  open,
  onOpenChange,
  driverIds,
}: BroadcastDialogProps) {
  const queryClient = useQueryClient()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { body: '' },
  })
  const { mutate, isPending } = useMutation({
    mutationFn: ({ body }: z.infer<typeof formSchema>) =>
      broadcastMessage(driverIds, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      toast.success(`Message sent to ${driverIds.length} drivers.`)
      form.reset()
      onOpenChange(false)
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Message all drivers on shift'
      description={`Sends to ${driverIds.length} drivers. Drivers who are driving see it when their van stops.`}
      formId='broadcast-form'
      submitLabel='Send to all'
      isPending={isPending}
    >
      <Form {...form}>
        <form
          id='broadcast-form'
          onSubmit={form.handleSubmit((values) => mutate(values))}
        >
          <FormField
            control={form.control}
            name='body'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
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
