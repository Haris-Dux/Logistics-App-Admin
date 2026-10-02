import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDrivers } from './drivers-provider'

export function DriversPrimaryButtons() {
  const { setOpen } = useDrivers()
  return (
    <Button onClick={() => setOpen('add')}>
      <UserPlus />
      Add driver
    </Button>
  )
}
