import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { KeyRound, Smartphone, UserCheck, UserPen, UserX } from 'lucide-react'
import { type Driver } from '@/api/drivers'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDrivers } from './drivers-provider'

type DataTableRowActionsProps = {
  row: Row<Driver>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useDrivers()
  const driver = row.original
  const openDialog = (dialog: Parameters<typeof setOpen>[0]) => {
    setCurrentRow(driver)
    setOpen(dialog)
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuItem onClick={() => openDialog('edit')}>
          Edit
          <DropdownMenuShortcut>
            <UserPen size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openDialog('reset-password')}>
          Reset password
          <DropdownMenuShortcut>
            <KeyRound size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!driver.deviceId}
          onClick={() => openDialog('release-login')}
        >
          Release login
          <DropdownMenuShortcut>
            <Smartphone size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant={driver.active ? 'destructive' : 'default'}
          onClick={() => openDialog('toggle-active')}
        >
          {driver.active ? 'Deactivate' : 'Activate'}
          <DropdownMenuShortcut>
            {driver.active ? <UserX size={16} /> : <UserCheck size={16} />}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
