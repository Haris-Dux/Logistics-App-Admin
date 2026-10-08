import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Messages } from '@/features/messages'

const messagesSearchSchema = z.object({
  /** Driver whose conversation is open. */
  driver: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/messages/')({
  validateSearch: messagesSearchSchema,
  component: Messages,
})
