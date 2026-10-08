import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { type Admin, createAdmin, updateAdmin } from '@/api/admins'
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
import { DepotField, HEAD_OFFICE } from '@/components/depot-field'
import { FormDialog } from '@/components/form-dialog'
import { PasswordFields } from '@/components/password-fields'

const formSchema = (isEdit: boolean) =>
  z
    .object({
      name: z.string().trim().min(1, 'Name is required.'),
      email: z.email('Enter a valid email.'),
      username: z.string().trim().min(1, 'Username is required.'),
      depotId: z.string().min(1, 'Choose head office or a depot.'),
      ...newPasswordFields,
    })
    .superRefine(checkNewPassword(!isEdit))
type AdminForm = z.infer<ReturnType<typeof formSchema>>

type AdminFormDialogProps = {
  /** Admin to edit; omit to add a new one. */
  currentRow?: Admin
  open: boolean
  onOpenChange: (open: boolean) => void
}

const FIELDS = [
  { name: 'name', label: 'Full name' },
  { name: 'email', label: 'Email' },
  { name: 'username', label: 'Username' },
] as const

export function AdminFormDialog({
  currentRow,
  open,
  onOpenChange,
}: AdminFormDialogProps) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const form = useForm<AdminForm>({
    resolver: zodResolver(formSchema(isEdit)),
    defaultValues: {
      name: currentRow?.name ?? '',
      email: currentRow?.email ?? '',
      username: currentRow?.username ?? '',
      depotId: currentRow ? (currentRow.depotId ?? HEAD_OFFICE) : '',
      password: '',
      confirmPassword: '',
    },
  })
  const { mutate, isPending } = useMutation({
    mutationFn: ({
      confirmPassword: _,
      password,
      depotId,
      ...admin
    }: AdminForm) => {
      const input = {
        ...admin,
        depotId: depotId === HEAD_OFFICE ? null : depotId,
      }
      return currentRow
        ? updateAdmin(currentRow.id, input)
        : createAdmin({ ...input, password })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      toast.success(isEdit ? 'Admin updated.' : 'Admin added.')
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
      title={isEdit ? 'Edit admin' : 'Add admin'}
      description='Depot admins only see their own depot; head office sees every depot.'
      formId='admin-form'
      submitLabel={isEdit ? 'Save changes' : 'Add admin'}
      isPending={isPending}
    >
      <Form {...form}>
        <form
          id='admin-form'
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
          <DepotField allowHeadOffice />
          {!isEdit && <PasswordFields />}
        </form>
      </Form>
    </FormDialog>
  )
}
