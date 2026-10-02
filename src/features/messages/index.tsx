import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { MessagesSquare } from 'lucide-react'
import { driversQueryOptions } from '@/api/drivers'
import { conversationsQueryOptions } from '@/api/messages'
import { shiftsQueryOptions } from '@/api/shifts'
import { useDepotId } from '@/stores/depot-store'
import { todayParam } from '@/lib/dates'
import useDialogState from '@/hooks/use-dialog-state'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { BroadcastDialog } from './components/broadcast-dialog'
import { type Contact } from './components/contact'
import { ConversationList } from './components/conversation-list'
import { ConversationThread } from './components/conversation-thread'
import { TemplateDialog } from './components/template-dialog'

const route = getRouteApi('/_authenticated/messages/')

export function Messages() {
  const { driver: selectedDriverId } = route.useSearch()
  const navigate = route.useNavigate()
  const depotId = useDepotId()
  const today = todayParam()
  const [dialog, setDialog] = useDialogState<'broadcast' | 'template'>()

  const { data: drivers = [] } = useQuery(driversQueryOptions({ depotId }))
  const { data: shifts = [] } = useQuery(
    shiftsQueryOptions({ from: today, to: today, depotId })
  )
  const { data: conversations = [] } = useQuery(conversationsQueryOptions())

  // Drivers with a conversation (newest first), then anyone else on shift
  const contacts: Contact[] = drivers
    .map((driver) => ({
      driver,
      shift: shifts.find((shift) => shift.driverId === driver.id),
      conversation: conversations.find((c) => c.driverId === driver.id),
    }))
    .filter(({ shift, conversation }) => shift || conversation)
    .sort(
      (a, b) =>
        (b.conversation?.lastMessage.sentAt.getTime() ?? 0) -
        (a.conversation?.lastMessage.sentAt.getTime() ?? 0)
    )
  const selected = contacts.find(({ driver }) => driver.id === selectedDriverId)
  const onShiftDriverIds = shifts
    .filter((shift) => shift.status !== 'ended')
    .map((shift) => shift.driverId)

  return (
    <>
      <AppHeader />
      <Main
        fixed
        className='flex flex-col gap-4 max-sm:overflow-y-auto sm:flex-row'
      >
        <ConversationList
          contacts={contacts}
          selectedDriverId={selectedDriverId}
          onSelect={(driver) => navigate({ search: { driver } })}
          onBroadcast={() => setDialog('broadcast')}
        />
        {selected ? (
          <ConversationThread
            key={selected.driver.id}
            contact={selected}
            onAddTemplate={() => setDialog('template')}
          />
        ) : (
          <section className='flex flex-1 flex-col items-center justify-center gap-2 rounded-md border text-muted-foreground'>
            <MessagesSquare className='size-10' />
            <p>Pick a driver to see your messages.</p>
          </section>
        )}
      </Main>

      <BroadcastDialog
        open={dialog === 'broadcast'}
        onOpenChange={() => setDialog('broadcast')}
        driverIds={onShiftDriverIds}
      />
      <TemplateDialog
        open={dialog === 'template'}
        onOpenChange={() => setDialog('template')}
      />
    </>
  )
}
