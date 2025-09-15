import { formatQuantity } from '../formatQuantity'

describe('formatQuantity', () => {
  test('handles integers', () => {
    expect(formatQuantity(5)).toBe('5')
  })

  test('rounds to max decimals and trims zeros', () => {
    expect(formatQuantity(1.23456, 3)).toBe('1.235')
    expect(formatQuantity(1.2, 3)).toBe('1.2')
    expect(formatQuantity(1.20001, 3)).toBe('1.2')
    expect(formatQuantity(1.0004, 3)).toBe('1')
  })

  test('returns 0 for NaN/Infinity', () => {
    // @ts-expect-error test invalid inputs
    expect(formatQuantity(NaN)).toBe('0')
    expect(formatQuantity(Infinity as unknown as number)).toBe('0')
  })
})

