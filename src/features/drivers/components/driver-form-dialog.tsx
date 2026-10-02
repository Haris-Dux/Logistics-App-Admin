import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { type Driver, createDriver, updateDriver } from '@/api/drivers'
import { checkNewPassword, newPasswordFields } from '@/lib/validation'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { DepotField } from '@/components/depot-field'
import { FormDialog } from '@/components/form-dialog'
import { PasswordFields } from '@/components/password-fields'

const formSchema = (isEdit: boolean) =>
  z
    .object({
      name: z.string().trim().min(1, 'Name is required.'),
      username: z.string().trim().min(1, 'Username is required.'),
      phone: z.string().trim().min(1, 'Phone number is required.'),
      depotId: z.string().min(1, 'Depot is required.'),
      ...newPasswordFields,
    })
    .superRefine(checkNewPassword(!isEdit))
type DriverForm = z.infer<ReturnType<typeof formSchema>>

type DriverFormDialogProps = {
  /** Driver to edit; omit to add a new one. */
  currentRow?: Driver
  open: boolean
  onOpenChange: (open: boolean) => void
}

const FIELDS = [
  { name: 'name', label: 'Full name' },
  { name: 'username', label: 'Username' },
  { name: 'phone', label: 'Phone number' },
] as const

export function DriverFormDialog({
  currentRow,
  open,
  onOpenChange,
}: DriverFormDialogProps) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const form = useForm<DriverForm>({
    resolver: zodResolver(formSchema(isEdit)),
    defaultValues: {
      name: currentRow?.name ?? '',
      username: currentRow?.username ?? '',
      phone: currentRow?.phone ?? '',
      depotId: currentRow?.depotId ?? '',
      password: '',
      confirmPassword: '',
    },
  })
  const { mutate, isPending } = useMutation({
    mutationFn: ({ confirmPassword: _, password, ...driver }: DriverForm) =>
      currentRow
        ? updateDriver(currentRow.id, driver)
        : createDriver({ ...driver, password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
      toast.success(isEdit ? 'Driver updated.' : 'Driver added.')
      form.reset()
      onOpenChange(false)
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
      title={isEdit ? 'Edit driver' : 'Add driver'}
      description={
        isEdit
          ? 'Update the driver details.'
          : 'The driver signs in to the app with this username and password.'
      }
      formId='driver-form'
      submitLabel={isEdit ? 'Save changes' : 'Add driver'}
      isPending={isPending}
    >
      <Form {...form}>
        <form
          id='driver-form'
          onSubmit={form.handleSubmit((values) => mutate(values))}
          className='space-y-4'
        >
          {FIELDS.map(({ name, label }) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <Input autoComplete='off' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <DepotField />
          {!isEdit && <PasswordFields />}
        </form>
      </Form>
    </FormDialog>
  )
}
