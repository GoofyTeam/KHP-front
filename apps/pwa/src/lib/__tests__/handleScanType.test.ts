import { beforeEach, describe, expect, it, vi } from 'vitest'
vi.mock('../../graphql/getIngredient.gql', () => ({
  GetIngredient: 'GET_INGREDIENT_DOC',
  __esModule: true,
}))

vi.mock('../../graphql/openFoodFactsProxy.gql', () => ({
  OpenFoodFactsProxy: 'OPEN_FOOD_FACTS_DOC',
  __esModule: true,
}))

import handleScanType from '../handleScanType'
import { graphqlRequest } from '../graph-client'
import { GetIngredient } from '../../graphql/getIngredient.gql'
import { OpenFoodFactsProxy } from '../../graphql/openFoodFactsProxy.gql'
import type { GetIngredientQuery } from '../../graphql/getIngredient.gql'
import type { OpenFoodFactsProxyQuery } from '../../graphql/openFoodFactsProxy.gql'

vi.mock('../graph-client', () => ({
  graphqlRequest: vi.fn(),
}))

const mockGraphqlRequest = vi.mocked(graphqlRequest)

describe('handleScanType', () => {
  beforeEach(() => {
    mockGraphqlRequest.mockReset()
  })

  it('returns ingredient data when barcode exists in database', async () => {
    mockGraphqlRequest.mockResolvedValueOnce({
      ingredient: {
        id: 'ING-1',
        image_url: 'https://img',
        name: 'Farine',
        category: { id: 'cat', name: 'Ingredients secs', __typename: 'Category' },
        unit: 'kg',
        base_quantity: 5,
        base_unit: 'kg',
        quantities: [{ id: 'q1' }],
        __typename: 'Ingredient',
      },
    } as unknown as GetIngredientQuery)

    const result = await handleScanType('barcode', '1234567890')

    expect(mockGraphqlRequest).toHaveBeenCalledTimes(1)
    expect(mockGraphqlRequest).toHaveBeenCalledWith(GetIngredient, {
      barcode: '1234567890',
    })
    expect(result).toMatchObject({
      product_image: 'https://img',
      product_name: 'Farine',
      product_category: { id: 'cat', name: 'Ingredients secs' },
      product_units: 'kg',
      product_base_unit: 'kg',
      product_base_quantity: '5',
      product_already_in_database: true,
      product_internal_id: 'ING-1',
      quantities: [{ id: 'q1' }],
    })
  })

  it('falls back to OpenFoodFacts when barcode is unknown', async () => {
    mockGraphqlRequest
      .mockResolvedValueOnce({ ingredient: null } as unknown as GetIngredientQuery)
      .mockResolvedValueOnce({
        search: {
          imageUrl: 'http://cdn/image.png',
          product_name: 'Chocolat',
          base_quantity: 2,
          is_already_in_database: false,
          ingredient_id: null,
          unit: 'kg',
        },
      } as unknown as OpenFoodFactsProxyQuery)

    const result = await handleScanType('barcode', '0987654321')

    expect(mockGraphqlRequest).toHaveBeenNthCalledWith(1, GetIngredient, {
      barcode: '0987654321',
    })
    expect(mockGraphqlRequest).toHaveBeenNthCalledWith(2, OpenFoodFactsProxy, {
      barcode: '0987654321',
      page: 1,
    })
    expect(result).toMatchObject({
      product_image: 'http://cdn/image.png',
      product_name: 'Chocolat',
      product_category: { id: '', name: '' },
      product_units: '',
      product_base_unit: 'kg',
      product_base_quantity: '2',
      product_already_in_database: false,
      product_internal_id: undefined,
    })
  })

  it('throws when product cannot be located for internal id', async () => {
    mockGraphqlRequest.mockResolvedValueOnce({
      ingredient: null,
    } as unknown as GetIngredientQuery)

    await expect(handleScanType('internalId', 'ING-404')).rejects.toThrow(
      'Product not found'
    )
    expect(mockGraphqlRequest).toHaveBeenCalledWith(GetIngredient, {
      id: 'ING-404',
    })
  })

  it('returns default shape in manual mode without calling API', async () => {
    const result = await handleScanType('manual', undefined)
    expect(mockGraphqlRequest).not.toHaveBeenCalled()
    expect(result).toMatchObject({
      product_image: '',
      product_name: '',
      product_category: { id: '', name: '' },
      product_units: '',
      product_base_unit: '',
      product_already_in_database: false,
      product_internal_id: undefined,
    })
  })
})
