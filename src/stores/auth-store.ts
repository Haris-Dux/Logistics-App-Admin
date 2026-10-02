import { create } from 'zustand'
import { type Admin } from '@/api/admins'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'logisticapp_access_token'
const AUTH_USER = 'logisticapp_auth_user'

type AuthUser = Pick<Admin, 'id' | 'name' | 'email' | 'username' | 'depotId'>

type Session = { token: string; user: AuthUser }

interface AuthState {
  auth: {
    user: AuthUser | null
    accessToken: string
    setSession: (session: Session) => void
    reset: () => void
  }
}

function readCookie<T>(name: string): T | null {
  const value = getCookie(name)
  return value ? (JSON.parse(decodeURIComponent(value)) as T) : null
}

function writeCookie(name: string, value: unknown) {
  setCookie(name, encodeURIComponent(JSON.stringify(value)))
}

export const useAuthStore = create<AuthState>()((set) => ({
  auth: {
    user: readCookie<AuthUser>(AUTH_USER),
    accessToken: readCookie<string>(ACCESS_TOKEN) ?? '',
    setSession: ({ token, user: { id, name, email, username, depotId } }) =>
      set((state) => {
        const user = { id, name, email, username, depotId }
        writeCookie(ACCESS_TOKEN, token)
        writeCookie(AUTH_USER, user)
        return { ...state, auth: { ...state.auth, user, accessToken: token } }
      }),
    reset: () =>
      set((state) => {
        removeCookie(ACCESS_TOKEN)
        removeCookie(AUTH_USER)
        return {
          ...state,
          auth: { ...state.auth, user: null, accessToken: '' },
        }
      }),
  },
}))
