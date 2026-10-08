import { useQuery } from '@tanstack/react-query'
import { ChevronsUpDown, Warehouse } from 'lucide-react'
import { depotsQueryOptions } from '@/api/depots'
import { useAuthStore } from '@/stores/auth-store'
import { useDepotId, useDepotStore } from '@/stores/depot-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

const ALL_DEPOTS = 'All depots'

/** Depot scope for the whole portal. Only head-office admins can switch. */
export function DepotSwitcher() {
  const { isMobile } = useSidebar()
  const isHeadOffice = useAuthStore(
    (state) => state.auth.user?.depotId === null
  )
  const setSelectedDepotId = useDepotStore((state) => state.setSelectedDepotId)
  const depotId = useDepotId()
  const { data: depots = [] } = useQuery(depotsQueryOptions())
  const depotName = depots.find((depot) => depot.id === depotId)?.name

  const title = (
    <>
      <div className='flex aspect-square size-8 items-center justify-center rounded-lg'>
      <img src="/images/icon.png" alt="LogisticApp" className="size-7 object-contain"/>
      </div>
      <div className='grid flex-1 text-start text-sm leading-tight'>
        <span className='truncate font-semibold'>LogisticApp Admin</span>
        <span className='truncate text-xs'>{depotName ?? ALL_DEPOTS}</span>
      </div>
    </>
  )

  if (!isHeadOffice) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' className='pointer-events-none'>
            {title}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              {title}
              <ChevronsUpDown className='ms-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              Depot
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setSelectedDepotId(null)}
              className='gap-2 p-2'
            >
              {ALL_DEPOTS}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {depots.map((depot) => (
              <DropdownMenuItem
                key={depot.id}
                onClick={() => setSelectedDepotId(depot.id)}
                className='gap-2 p-2'
              >
                <div className='flex size-6 items-center justify-center rounded-sm border'>
                  <Warehouse className='size-4 shrink-0' />
                </div>
                {depot.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
