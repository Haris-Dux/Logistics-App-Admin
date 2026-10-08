import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createMessageTemplate } from '@/api/message-templates'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FormDialog } from '@/components/form-dialog'

const formSchema = z.object({
  text: z.string().trim().min(1, 'Please enter the template text.').max(80),
})

type TemplateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplateDialog({ open, onOpenChange }: TemplateDialogProps) {
  const queryClient = useQueryClient()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: '' },
  })
  const { mutate, isPending } = useMutation({
    mutationFn: ({ text }: z.infer<typeof formSchema>) =>
      createMessageTemplate(text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] })
      form.reset()
      onOpenChange(false)
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title='New message template'
      description='Templates appear as one-click messages above the message box.'
      formId='template-form'
      submitLabel='Add template'
      isPending={isPending}
    >
      <Form {...form}>
        <form
          id='template-form'
          onSubmit={form.handleSubmit((values) => mutate(values))}
        >
          <FormField
            control={form.control}
            name='text'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text</FormLabel>
                <FormControl>
                  <Input autoComplete='off' {...field} />
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
