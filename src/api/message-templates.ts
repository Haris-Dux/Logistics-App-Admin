import { z } from 'zod'
import { queryOptions } from '@tanstack/react-query'
import { apiClient, apiGet } from './client'

const messageTemplateSchema = z.object({
  id: z.string(),
  text: z.string(),
})

export const messageTemplatesQueryOptions = () =>
  queryOptions({
    queryKey: ['message-templates'],
    queryFn: () => apiGet(z.array(messageTemplateSchema), '/message-templates'),
  })

export async function createMessageTemplate(text: string) {
  await apiClient.post('/message-templates', { text })
}
