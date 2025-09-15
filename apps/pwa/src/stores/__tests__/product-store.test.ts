import { beforeEach, describe, expect, it } from 'vitest'
import type { GetProductQuery } from '../../graphql/getProduct.gql'
import { useProduct } from '../product-store'

const resetStore = () =>
  useProduct.setState({
    currentProduct: null,
    isLoading: false,
  })

describe('useProduct store', () => {
  beforeEach(() => {
    resetStore()
  })

  it('stores and clears the current product', () => {
    const product = {
      id: '123',
      name: 'Pain',
    } as NonNullable<GetProductQuery['ingredient']>

    useProduct.getState().setCurrentProduct(product)
    expect(useProduct.getState().currentProduct).toBe(product)

    useProduct.getState().setCurrentProduct(null)
    expect(useProduct.getState().currentProduct).toBeNull()
  })

  it('toggles loading state', () => {
    useProduct.getState().setIsLoading(true)
    expect(useProduct.getState().isLoading).toBe(true)

    useProduct.getState().setIsLoading(false)
    expect(useProduct.getState().isLoading).toBe(false)
  })
})
