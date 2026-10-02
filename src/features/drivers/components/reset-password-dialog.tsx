import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { type Driver, resetDriverPassword } from '@/api/drivers'
import { checkNewPassword, newPasswordFields } from '@/lib/validation'
import { Form } from '@/components/ui/form'
import { FormDialog } from '@/components/form-dialog'
import { PasswordFields } from '@/components/password-fields'

const formSchema = z
  .object(newPasswordFields)
  .superRefine(checkNewPassword(true))

type ResetPasswordDialogProps = {
  currentRow: Driver
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResetPasswordDialog({
  currentRow,
  open,
  onOpenChange,
}: ResetPasswordDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })
  const { mutate, isPending } = useMutation({
    mutationFn: ({ password }: z.infer<typeof formSchema>) =>
      resetDriverPassword(currentRow.id, password),
    onSuccess: () => {
      toast.success(`Password reset for ${currentRow.name}.`)
      onOpenChange(false)
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Reset password'
      description={`Set a new password for ${currentRow.name}. Share it with the driver so they can sign in.`}
      formId='reset-password-form'
      submitLabel='Reset password'
      isPending={isPending}
    >
      <Form {...form}>
        <form
          id='reset-password-form'
          onSubmit={form.handleSubmit((values) => mutate(values))}
          className='space-y-4'
        >
          <PasswordFields />
        </form>
      </Form>
    </FormDialog>
  )
}
