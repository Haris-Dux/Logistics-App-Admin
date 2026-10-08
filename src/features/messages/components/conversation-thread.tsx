import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Send } from 'lucide-react'
import { messageTemplatesQueryOptions } from '@/api/message-templates'
import {
  type Message,
  conversationQueryOptions,
  markMessagesRead,
  sendMessage,
} from '@/api/messages'
import { formatDateTime, formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/status-badge'
import { type Contact, contactStatus } from './contact'

function deliveryStatus(message: Message) {
  if (message.readAt) return 'Read'
  if (message.deliveredAt) return 'Delivered ✓'
  return 'Sent'
}

function MessageBubble({ message }: { message: Message }) {
  const outbound = message.direction === 'outbound'
  return (
    <li
      className={cn(
        'flex flex-col gap-1',
        outbound ? 'items-end' : 'items-start'
      )}
    >
      <div
        title={formatDateTime(message.sentAt)}
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
          outbound ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {message.body}
        {message.quickReply && (
          <Badge variant='outline' className='ms-2'>
            quick reply
          </Badge>
        )}
      </div>
      <span className='text-xs text-muted-foreground'>
        {formatTime(message.sentAt)}
        {outbound && ` · ${deliveryStatus(message)}`}
      </span>
    </li>
  )
}

type ConversationThreadProps = {
  contact: Contact
  onAddTemplate: () => void
}

export function ConversationThread({
  contact,
  onAddTemplate,
}: ConversationThreadProps) {
  const { driver, shift, conversation } = contact
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const { data: messages } = useQuery(conversationQueryOptions(driver.id))
  const { data: templates = [] } = useQuery(messageTemplatesQueryOptions())

  const refetchMessages = () =>
    queryClient.invalidateQueries({ queryKey: ['messages'] })
  const send = useMutation({
    mutationFn: (body: string) => sendMessage(driver.id, body),
    onSuccess: () => {
      setDraft('')
      refetchMessages()
    },
  })
  const { mutate: markRead } = useMutation({
    mutationFn: markMessagesRead,
    onSuccess: refetchMessages,
  })

  const unreadIds = conversation?.unreadIds.join() ?? ''
  useEffect(() => {
    if (unreadIds) markRead(unreadIds.split(','))
  }, [unreadIds, markRead])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  const firstName = driver.name.split(' ')[0]

  return (
    <section className='flex min-h-0 flex-1 flex-col gap-4 rounded-md border p-4 max-sm:min-h-[70svh] max-sm:shrink-0'>
      <header className='flex flex-wrap items-center gap-2 border-b pb-3'>
        <h3 className='text-lg font-semibold'>{driver.name}</h3>
        {shift && (
          <span className='text-muted-foreground'>
            · {shift.vehicle.registration} · Route {shift.routeNumber}
          </span>
        )}
        <StatusBadge status={contactStatus(contact)} />
      </header>

      {shift?.status === 'driving' && (
        <p className='rounded-md border border-amber-500 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300'>
          {firstName} is driving. Your message will show when the van stops.
          Replies are locked while moving (UK law).
        </p>
      )}

      <ScrollArea className='min-h-0 flex-1'>
        {!messages ? (
          <Skeleton className='h-40 w-full' />
        ) : (
          <ul className='flex flex-col gap-4 pe-3'>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </ul>
        )}
        <div ref={endRef} />
      </ScrollArea>

      <div className='flex flex-wrap gap-2'>
        {templates.map((template) => (
          <Button
            key={template.id}
            variant='outline'
            size='sm'
            className='rounded-full'
            onClick={() => setDraft(template.text)}
          >
            {template.text}
          </Button>
        ))}
        <Button
          variant='outline'
          size='sm'
          className='rounded-full'
          onClick={onAddTemplate}
        >
          <Plus />
          template
        </Button>
      </div>

      <form
        className='flex gap-2'
        onSubmit={(event) => {
          event.preventDefault()
          if (draft.trim()) send.mutate(draft.trim())
        }}
      >
        <Input
          placeholder='Type a message...'
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button type='submit' disabled={!draft.trim() || send.isPending}>
          <Send />
          Send
        </Button>
      </form>
    </section>
  )
}
