import { type z } from 'zod'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // Repeat array params (`status=a&status=b`) instead of `status[]=a`
  paramsSerializer: { indexes: null },
})

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState().auth
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

/** GET a resource and validate the response at the API boundary. */
export async function apiGet<T extends z.ZodType>(
  schema: T,
  url: string,
  params?: object
): Promise<z.output<T>> {
  const { data } = await apiClient.get<unknown>(url, { params })
  return schema.parse(data)
}

/** POST a body and validate the response at the API boundary. */
export async function apiPost<T extends z.ZodType>(
  schema: T,
  url: string,
  body: unknown
): Promise<z.output<T>> {
  const { data } = await apiClient.post<unknown>(url, body)
  return schema.parse(data)
}
