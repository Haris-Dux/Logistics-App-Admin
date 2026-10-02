import { useState } from 'react'
import { Send } from 'lucide-react'
import { formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatusDot } from '@/components/status-badge'
import { type Contact, contactStatus } from './contact'

type ConversationListProps = {
  contacts: Contact[]
  selectedDriverId?: string
  onSelect: (driverId: string) => void
  onBroadcast: () => void
}

export function ConversationList({
  contacts,
  selectedDriverId,
  onSelect,
  onBroadcast,
}: ConversationListProps) {
  const [query, setQuery] = useState('')
  const term = query.trim().toLowerCase()
  const visible = contacts.filter(({ driver }) =>
    driver.name.toLowerCase().includes(term)
  )

  return (
    <aside className='flex min-h-0 flex-col gap-3 rounded-md border p-3 max-sm:max-h-80 max-sm:shrink-0 sm:w-72 lg:w-80'>
      <Input
        placeholder='Search drivers'
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <Button variant='ghost' className='justify-start' onClick={onBroadcast}>
        <Send />
        Message all drivers on shift
      </Button>
      <ScrollArea className='min-h-0 flex-1'>
        <ul className='flex flex-col gap-1 pe-3'>
          {visible.map((contact) => {
            const { driver, shift, conversation } = contact
            const status = contactStatus(contact)
            const unread = conversation?.unreadIds.length ?? 0
            return (
              <li key={driver.id}>
                <button
                  type='button'
                  onClick={() => onSelect(driver.id)}
                  className={cn(
                    'flex w-full gap-3 rounded-md px-3 py-2 text-start text-sm hover:bg-accent',
                    driver.id === selectedDriverId && 'bg-accent'
                  )}
                >
                  <StatusDot status={status} className='mt-1.5' />
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <p className='min-w-0 truncate'>
                        <span className='font-semibold'>{driver.name}</span>
                        {shift && ` · ${shift.vehicle.registration}`}
                      </p>
                      {conversation && (
                        <span className='ms-auto shrink-0 text-xs text-muted-foreground'>
                          {formatTime(conversation.lastMessage.sentAt)}
                        </span>
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      <p className='min-w-0 truncate text-muted-foreground'>
                        {conversation?.lastMessage.body ?? 'No messages yet'}
                      </p>
                      {unread > 0 && (
                        <Badge className='ms-auto rounded-full px-1.5'>
                          {unread}
                        </Badge>
                      )}
                    </div>
                    <p
                      className='text-xs font-semibold'
                      style={{ color: status.color }}
                    >
                      {status.label}
                      {shift?.status === 'offline' &&
                        ' · gets messages when back in signal'}
                    </p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </ScrollArea>
    </aside>
  )
}
