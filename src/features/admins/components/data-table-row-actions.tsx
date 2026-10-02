import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { UserCheck, UserPen, UserX } from 'lucide-react'
import { type Admin } from '@/api/admins'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAdmins } from './admins-provider'

type DataTableRowActionsProps = {
  row: Row<Admin>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useAdmins()
  const signedInId = useAuthStore((state) => state.auth.user?.id)
  const admin = row.original
  const openDialog = (dialog: Parameters<typeof setOpen>[0]) => {
    setCurrentRow(admin)
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
      <DropdownMenuContent align='end' className='w-44'>
        <DropdownMenuItem onClick={() => openDialog('edit')}>
          Edit
          <DropdownMenuShortcut>
            <UserPen size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          // Admins cannot lock themselves out
          disabled={admin.id === signedInId}
          variant={admin.active ? 'destructive' : 'default'}
          onClick={() => openDialog('toggle-active')}
        >
          {admin.active ? 'Deactivate' : 'Activate'}
          <DropdownMenuShortcut>
            {admin.active ? <UserX size={16} /> : <UserCheck size={16} />}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
