import { type Driver } from '@/api/drivers'
import { createRowDialogContext } from '@/context/row-dialog-context'

type DriversDialogType =
  | 'add'
  | 'edit'
  | 'reset-password'
  | 'release-login'
  | 'toggle-active'

export const [DriversProvider, useDrivers] = createRowDialogContext<
  Driver,
  DriversDialogType
>('Drivers')
