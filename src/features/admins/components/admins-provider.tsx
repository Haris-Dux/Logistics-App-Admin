import { type Admin } from '@/api/admins'
import { createRowDialogContext } from '@/context/row-dialog-context'

type AdminsDialogType = 'add' | 'edit' | 'toggle-active'

export const [AdminsProvider, useAdmins] = createRowDialogContext<
  Admin,
  AdminsDialogType
>('Admins')
