import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('@/lib/ApolloClient', () => ({
  query: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('ROUTE_NOT_FOUND')
  }),
}))

import { fetchIngredient } from '../ingredient-query'
import { query } from '@/lib/ApolloClient'
import { notFound } from 'next/navigation'

const mockQuery = vi.mocked(query)
const mockNotFound = vi.mocked(notFound)
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('fetchIngredient', () => {
  beforeEach(() => {
    mockQuery.mockReset()
    mockNotFound.mockClear()
    consoleErrorSpy.mockClear()
  })

  it('returns ingredient data when the query succeeds', async () => {
    const ingredient = { id: 'ING-1', name: 'Sugar' }
    mockQuery.mockResolvedValue({ data: { ingredient } })

    await expect(fetchIngredient('ING-1')).resolves.toBe(ingredient)
    expect(mockQuery).toHaveBeenCalledWith({
      query: expect.anything(),
      variables: { id: 'ING-1' },
    })
    expect(mockNotFound).not.toHaveBeenCalled()
  })

  it('triggers notFound when ingredient is missing', async () => {
    mockQuery.mockResolvedValue({ data: { ingredient: null } })

    await expect(fetchIngredient('ING-404')).rejects.toThrow('ROUTE_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })

  it('rethrows when GraphQL returns an error field', async () => {
    const gqlError = new Error('GraphQL exploded')
    mockQuery.mockResolvedValue({ data: null, error: gqlError })

    await expect(fetchIngredient('ING-2')).rejects.toBe(gqlError)
    expect(mockNotFound).not.toHaveBeenCalled()
  })

  it('rethrows unauthenticated errors without calling notFound', async () => {
    const authError = new Error('Unauthenticated')
    mockQuery.mockRejectedValue(authError)

    await expect(fetchIngredient('ING-3')).rejects.toBe(authError)
    expect(mockNotFound).not.toHaveBeenCalled()
  })

  it('delegates not-found errors to the router helper', async () => {
    mockQuery.mockRejectedValue(new Error('Ingredient not found'))

    await expect(fetchIngredient('ING-404')).rejects.toThrow('ROUTE_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })
})

afterAll(() => {
  consoleErrorSpy.mockRestore()
})
