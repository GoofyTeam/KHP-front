import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../lib/httpClient', () => {
  return {
    httpClient: {
      get: vi.fn(),
    },
  }
})

import { useUserStore } from '../user-store'
import { httpClient } from '../../lib/httpClient'

const mockGet = vi.mocked(httpClient.get)

const resetStore = () =>
  useUserStore.setState({
    user: null,
    isLoading: false,
    error: null,
  })

describe('useUserStore', () => {
  beforeEach(() => {
    resetStore()
    mockGet.mockReset()
  })

  it('fetchUser stores returned user data', async () => {
    const user = { id: 1, name: 'Jane', email: 'jane@example.com' }
    mockGet.mockResolvedValue({ user })

    const promise = useUserStore.getState().fetchUser()
    expect(useUserStore.getState().isLoading).toBe(true)

    const result = await promise

    expect(result).toEqual({ success: true, data: user })
    expect(useUserStore.getState()).toMatchObject({
      user,
      isLoading: false,
      error: null,
    })
    expect(mockGet).toHaveBeenCalledWith('/api/user')
  })

  it('flags missing users as an error', async () => {
    mockGet.mockResolvedValue({ user: null })

    const result = await useUserStore.getState().fetchUser()

    expect(result).toEqual({ success: false, error: 'User not found' })
    expect(useUserStore.getState()).toMatchObject({
      user: null,
      isLoading: false,
      error: 'User not found',
    })
  })

  it('surfaces network failures and clears user state', async () => {
    mockGet.mockRejectedValue(new Error('Network down'))

    const result = await useUserStore.getState().fetchUser()

    expect(result).toEqual({ success: false, error: 'Network down' })
    expect(useUserStore.getState()).toMatchObject({
      user: null,
      isLoading: false,
      error: 'Network down',
    })
  })

  it('clears user and error states via dedicated actions', () => {
    const user = { id: 1, name: 'Jane', email: 'jane@example.com' }

    useUserStore.setState({ user, error: 'boom' })

    useUserStore.getState().clearUser()
    expect(useUserStore.getState()).toMatchObject({ user: null, error: null })

    useUserStore.setState({ error: 'something went wrong' })
    useUserStore.getState().clearError()
    expect(useUserStore.getState().error).toBeNull()
  })
})
