import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'
import { InstallPWAButton } from '../InstallPWAButton'
import React from 'react'

// Minimal BeforeInstallPromptEvent mock
type MockBIP = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function dispatchBeforeInstallPrompt(outcome: 'accepted' | 'dismissed' = 'accepted') {
  const e: MockBIP = Object.assign(new Event('beforeinstallprompt'), {
    prompt: vi.fn().mockResolvedValue(undefined),
    userChoice: Promise.resolve({ outcome, platform: 'test' }),
  })
  act(() => {
    window.dispatchEvent(e)
  })
  return e
}

describe('InstallPWAButton', () => {
  test('is hidden by default and appears on beforeinstallprompt', async () => {
    const onVisibilityChange = vi.fn()
    render(<InstallPWAButton label="Install" onVisibilityChange={onVisibilityChange} />)

    expect(screen.queryByText('Install')).toBeNull()

    dispatchBeforeInstallPrompt()

    expect(await screen.findByText('Install')).toBeInTheDocument()
    expect(onVisibilityChange).toHaveBeenCalledWith(true)
  })

  test('clicking triggers prompt and then hides after choice', async () => {
    const onInstalled = vi.fn()
    const onVisibilityChange = vi.fn()
    render(
      <InstallPWAButton label="Install" onInstalled={onInstalled} onVisibilityChange={onVisibilityChange} />
    )

    const e = dispatchBeforeInstallPrompt('accepted')

    const btn = await screen.findByRole('button', { name: 'Install' })
    fireEvent.click(btn)

    await waitFor(() => {
      expect((e as any).prompt).toHaveBeenCalled()
    })

    // After user choice, it hides
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Install' })).toBeNull()
    })
    expect(onInstalled).toHaveBeenCalled()
    expect(onVisibilityChange).toHaveBeenCalledWith(false)
  })

  test('hides on appinstalled event', async () => {
    const onInstalled = vi.fn()
    const onVisibilityChange = vi.fn()
    render(
      <InstallPWAButton label="Install" onInstalled={onInstalled} onVisibilityChange={onVisibilityChange} />
    )

    dispatchBeforeInstallPrompt('dismissed')
    const btn = await screen.findByRole('button', { name: 'Install' })
    expect(btn).toBeInTheDocument()

    act(() => {
      window.dispatchEvent(new Event('appinstalled'))
    })

    await waitFor(() => expect(screen.queryByRole('button', { name: 'Install' })).toBeNull())
    expect(onInstalled).toHaveBeenCalled()
    expect(onVisibilityChange).toHaveBeenCalledWith(false)
  })
})
