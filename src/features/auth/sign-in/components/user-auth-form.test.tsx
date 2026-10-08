import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { UserAuthForm } from './user-auth-form'

const session = {
  token: 'token-1',
  user: {
    id: 'admin-1',
    name: 'Hannah Clarke',
    email: 'hannah.clarke@example.com',
    username: 'admin',
    depotId: null,
    active: true,
    lastLoginAt: null,
  },
}

const navigate = vi.fn()
const setSession = vi.fn()
const login = vi.fn()

vi.mock('@/api/auth', () => ({
  login: (credentials: unknown) => login(credentials),
}))

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (select: (state: unknown) => unknown) =>
    select({ auth: { setSession } }),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return { ...actual, useNavigate: () => navigate }
})

function renderForm(redirectTo?: string) {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <UserAuthForm redirectTo={redirectTo} />
    </QueryClientProvider>
  )
}

describe('UserAuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    login.mockResolvedValue(session)
  })

  it('shows validation messages when submitting an empty form', async () => {
    const screen = await renderForm()

    await userEvent.click(screen.getByRole('button', { name: /^Sign in$/i }))

    await expect
      .element(screen.getByText('Please enter your username.'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('Please enter your password.'))
      .toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('signs in, stores the session and opens the overview', async () => {
    const screen = await renderForm()

    await userEvent.fill(screen.getByLabelText('Username'), 'admin')
    await userEvent.fill(screen.getByLabelText('Password'), 'admin123')
    await userEvent.click(screen.getByRole('button', { name: /^Sign in$/i }))

    await vi.waitFor(() => expect(setSession).toHaveBeenCalledWith(session))
    expect(login).toHaveBeenCalledWith({
      username: 'admin',
      password: 'admin123',
    })
    expect(navigate).toHaveBeenCalledWith({ to: '/', replace: true })
  })

  it('returns to redirectTo after signing in', async () => {
    const screen = await renderForm('/live-map')

    await userEvent.fill(screen.getByLabelText('Username'), 'admin')
    await userEvent.fill(screen.getByLabelText('Password'), 'admin123')
    await userEvent.click(screen.getByRole('button', { name: /^Sign in$/i }))

    await vi.waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({ to: '/live-map', replace: true })
    )
  })
})
