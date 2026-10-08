import { clearCookies } from '@/test-utils/cookies'
import { beforeEach, describe, expect, it, vi } from 'vitest'

async function importAuthStore() {
  const { useAuthStore } = await import('./auth-store')
  return useAuthStore
}

const sampleUser = {
  id: 'admin-1',
  name: 'Hannah Clarke',
  email: 'hannah.clarke@example.com',
  username: 'admin',
  depotId: null,
}

describe('useAuthStore', () => {
  beforeEach(() => {
    clearCookies()
    vi.resetModules()
  })

  it('starts signed out when nothing is persisted', async () => {
    const useAuthStore = await importAuthStore()

    expect(useAuthStore.getState().auth.accessToken).toBe('')
    expect(useAuthStore.getState().auth.user).toBeNull()
  })

  it('persists the session so a new store instance reads it back', async () => {
    const useAuthStore = await importAuthStore()
    useAuthStore
      .getState()
      .auth.setSession({ token: 'session-token', user: sampleUser })

    vi.resetModules()
    const useAuthStoreAfterReload = await importAuthStore()

    expect(useAuthStoreAfterReload.getState().auth.accessToken).toBe(
      'session-token'
    )
    expect(useAuthStoreAfterReload.getState().auth.user).toEqual(sampleUser)
  })

  it('keeps only the identity fields of the signed-in admin', async () => {
    const useAuthStore = await importAuthStore()

    useAuthStore.getState().auth.setSession({
      token: 'session-token',
      user: { ...sampleUser, active: true, lastLoginAt: null } as never,
    })

    expect(useAuthStore.getState().auth.user).toEqual(sampleUser)
  })

  it('reset clears user and access token and drops persistence', async () => {
    const useAuthStore = await importAuthStore()
    useAuthStore
      .getState()
      .auth.setSession({ token: 'will-be-cleared', user: sampleUser })

    useAuthStore.getState().auth.reset()

    expect(useAuthStore.getState().auth.user).toBeNull()
    expect(useAuthStore.getState().auth.accessToken).toBe('')

    vi.resetModules()
    const useAuthStoreAfterReload = await importAuthStore()

    expect(useAuthStoreAfterReload.getState().auth.user).toBeNull()
    expect(useAuthStoreAfterReload.getState().auth.accessToken).toBe('')
  })
})
