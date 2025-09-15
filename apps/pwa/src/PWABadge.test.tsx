import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import PWABadge from './PWABadge'

const setOfflineReady = vi.fn()
const setNeedRefresh = vi.fn()
const updateServiceWorker = vi.fn()

vi.mock('virtual:pwa-register/react', () => {
  return {
    useRegisterSW: () => ({
      offlineReady: [true, setOfflineReady] as const,
      needRefresh: [true, setNeedRefresh] as const,
      updateServiceWorker,
    }),
  }
})

describe('PWABadge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('shows toast when offlineReady or needRefresh', () => {
    render(<PWABadge />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(
      screen.getByText(/New content available|App ready to work offline/)
    ).toBeInTheDocument()
  })

  test('clicking Reload calls updateServiceWorker(true)', () => {
    render(<PWABadge />)
    fireEvent.click(screen.getByText(/Reload/))
    expect(updateServiceWorker).toHaveBeenCalledWith(true)
  })

  test('clicking Close calls setters to hide', () => {
    render(<PWABadge />)
    fireEvent.click(screen.getByText(/Close/))
    expect(setOfflineReady).toHaveBeenCalledWith(false)
    expect(setNeedRefresh).toHaveBeenCalledWith(false)
  })
})

