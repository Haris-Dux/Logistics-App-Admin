import { type StatusMeta, shiftStatuses, statusColors } from '@/config/statuses'
import { type Driver } from '@/api/drivers'
import { type Conversation } from '@/api/messages'
import { type Shift } from '@/api/shifts'

/** A driver the admin can message, with today's shift and the latest message. */
export type Contact = {
  driver: Driver
  shift?: Shift
  conversation?: Conversation
}

const notOnShift: StatusMeta = {
  label: 'Not on shift',
  color: statusColors.lightSlate,
}

export const contactStatus = (contact: Contact) =>
  contact.shift ? shiftStatuses[contact.shift.status] : notOnShift
