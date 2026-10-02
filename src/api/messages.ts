import { z } from 'zod'
import { queryOptions } from '@tanstack/react-query'
import { apiClient, apiGet } from './client'

const messageSchema = z.object({
  id: z.string(),
  driverId: z.string(),
  direction: z.enum(['inbound', 'outbound']),
  body: z.string(),
  /** Sent by the driver with one tap from the app's quick replies. */
  quickReply: z.boolean(),
  sentAt: z.coerce.date(),
  deliveredAt: z.coerce.date().nullable(),
  readAt: z.coerce.date().nullable(),
})
export type Message = z.infer<typeof messageSchema>

export type Conversation = {
  driverId: string
  lastMessage: Message
  unreadIds: string[]
}

const messagesSchema = z.array(messageSchema)

const isUnread = (message: Message) =>
  message.direction === 'inbound' && !message.readAt

/** Latest message and unread replies per driver, newest conversation first. */
export const conversationsQueryOptions = () =>
  queryOptions({
    queryKey: ['messages', 'conversations'],
    queryFn: async () => {
      const messages = await apiGet(messagesSchema, '/messages', {
        _sort: 'sentAt',
      })
      const byDriver = new Map<string, Conversation>()
      for (const message of messages) {
        const unreadIds = byDriver.get(message.driverId)?.unreadIds ?? []
        if (isUnread(message)) unreadIds.push(message.id)
        byDriver.set(message.driverId, {
          driverId: message.driverId,
          lastMessage: message,
          unreadIds,
        })
      }
      return [...byDriver.values()].sort(
        (a, b) =>
          b.lastMessage.sentAt.getTime() - a.lastMessage.sentAt.getTime()
      )
    },
  })

export const conversationQueryOptions = (driverId: string) =>
  queryOptions({
    queryKey: ['messages', driverId],
    queryFn: () =>
      apiGet(messagesSchema, '/messages', { driverId, _sort: 'sentAt' }),
  })

export async function sendMessage(driverId: string, body: string) {
  await apiClient.post('/messages', { driverId, body })
}

export async function broadcastMessage(driverIds: string[], body: string) {
  await Promise.all(driverIds.map((driverId) => sendMessage(driverId, body)))
}

export async function markMessagesRead(ids: string[]) {
  const readAt = new Date().toISOString()
  await Promise.all(
    ids.map((id) => apiClient.patch(`/messages/${id}`, { readAt }))
  )
}
