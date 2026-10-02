import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdmins } from './admins-provider'

export function AdminsPrimaryButtons() {
  const { setOpen } = useAdmins()
  return (
    <Button onClick={() => setOpen('add')}>
      <UserPlus />
      Add admin
    </Button>
  )
}
