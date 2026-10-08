import { z } from 'zod'
import { adminSchema } from './admins'
import { apiPost } from './client'

const sessionSchema = z.object({
  token: z.string(),
  user: adminSchema,
})

type LoginCredentials = { username: string; password: string }

export const login = (credentials: LoginCredentials) =>
  apiPost(sessionSchema, '/auth/login', credentials)
