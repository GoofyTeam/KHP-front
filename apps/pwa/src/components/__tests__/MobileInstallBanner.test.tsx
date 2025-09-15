import { render, screen } from '@testing-library/react'
import { act } from 'react'
import React from 'react'
import MobileInstallBanner from '../MobileInstallBanner'

// Helper to control matchMedia queries for isTouchDevice and display-mode
function setMatchMediaMap(map: Record<string, boolean>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).matchMedia = (q: string) => ({
    matches: !!map[q],
    media: q,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

describe('MobileInstallBanner', () => {
  test('renders only when touch device and not standalone and Install prompt visible', async () => {
    setMatchMediaMap({
      '(hover: none) and (pointer: coarse)': true,
      '(any-hover: none) and (any-pointer: coarse)': true,
      '(display-mode: standalone)': false,
      'screen and (display-mode: standalone)': false,
    })

    // Fire beforeinstallprompt to make child button visible
    const e = Object.assign(new Event('beforeinstallprompt'), {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'dismissed', platform: 'test' }),
    })

    render(<MobileInstallBanner />)

    // Wait a tick for effects to attach listeners
    await Promise.resolve()

    act(() => {
      window.dispatchEvent(e)
    })

    // Banner should appear once button becomes visible
    expect(await screen.findByText(/Install KHP/)).toBeInTheDocument()
  })

  test('does not render in standalone mode', () => {
    setMatchMediaMap({
      '(hover: none) and (pointer: coarse)': true,
      '(any-hover: none) and (any-pointer: coarse)': true,
      '(display-mode: standalone)': true,
      'screen and (display-mode: standalone)': true,
    })

    render(<MobileInstallBanner />)
    expect(screen.queryByText(/Install KHP/)).toBeNull()
  })
})
