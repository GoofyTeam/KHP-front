import { beforeEach, describe, expect, it, vi } from 'vitest'
vi.mock('@workspace/graphql', () => ({
  GetIngredientDocument: 'GET_INGREDIENT_DOC',
  OpenFoodFactsProxyDocument: 'OPEN_FOOD_FACTS_DOC',
  __esModule: true,
}))

import handleScanType from '../handleScanType'
import { graphqlRequest } from '../graph-client'
import { graphqlRequestWithOffline } from '../offline-graphql'
import {
  GetIngredientDocument,
  OpenFoodFactsProxyDocument,
  type GetIngredientQuery,
  type OpenFoodFactsProxyQuery,
} from '@workspace/graphql'

vi.mock('../graph-client', () => ({
  graphqlRequest: vi.fn(),
}))

vi.mock('../offline-graphql', () => ({
  graphqlRequestWithOffline: vi.fn(),
}))

const mockGraphqlRequest = vi.mocked(graphqlRequest)
const mockGraphqlRequestWithOffline = vi.mocked(graphqlRequestWithOffline)

describe('handleScanType', () => {
  beforeEach(() => {
    mockGraphqlRequest.mockReset()
    mockGraphqlRequestWithOffline.mockReset()
  })

  it('returns ingredient data when barcode exists in database', async () => {
    mockGraphqlRequestWithOffline.mockResolvedValueOnce({
      data: {
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
      },
      source: 'network',
      timestamp: 123456,
    } as unknown as {
      data: GetIngredientQuery;
      source: 'network';
      timestamp: number;
    })

    const result = await handleScanType('barcode', '1234567890')

    expect(mockGraphqlRequestWithOffline).toHaveBeenCalledTimes(1)
    expect(mockGraphqlRequestWithOffline).toHaveBeenCalledWith(
      GetIngredientDocument,
      {
        barcode: '1234567890',
        includeStockMovements: false,
      }
    )
    expect(result.data).toMatchObject({
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
    expect(result.source).toBe('network')
  })

  it('falls back to OpenFoodFacts when barcode is unknown', async () => {
    mockGraphqlRequestWithOffline.mockResolvedValueOnce({
      data: { ingredient: null },
      source: 'network',
      timestamp: 0,
    } as unknown as {
      data: GetIngredientQuery;
      source: 'network';
      timestamp: number;
    })

    mockGraphqlRequest.mockResolvedValueOnce({
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

    expect(mockGraphqlRequestWithOffline).toHaveBeenCalledWith(
      GetIngredientDocument,
      {
        barcode: '0987654321',
        includeStockMovements: false,
      }
    )
    expect(mockGraphqlRequest).toHaveBeenCalledWith(OpenFoodFactsProxyDocument, {
      barcode: '0987654321',
      page: 1,
    })
    expect(result.data).toMatchObject({
      product_image: 'http://cdn/image.png',
      product_name: 'Chocolat',
      product_category: { id: '', name: '' },
      product_units: '',
      product_base_unit: 'kg',
      product_base_quantity: '2',
      product_already_in_database: false,
      product_internal_id: undefined,
    })
    expect(result.source).toBe('derived')
  })

  it('throws when product cannot be located for internal id', async () => {
    mockGraphqlRequestWithOffline.mockResolvedValueOnce({
      data: { ingredient: null },
      source: 'network',
      timestamp: 0,
    } as unknown as {
      data: GetIngredientQuery;
      source: 'network';
      timestamp: number;
    })

    await expect(handleScanType('internalId', 'ING-404')).rejects.toThrow(
      'Product not found'
    )
    expect(mockGraphqlRequestWithOffline).toHaveBeenCalledWith(
      GetIngredientDocument,
      {
        id: 'ING-404',
        includeStockMovements: false,
      }
    )
  })

  it('returns default shape in manual mode without calling API', async () => {
    const result = await handleScanType('manual', undefined)
    expect(mockGraphqlRequest).not.toHaveBeenCalled()
    expect(mockGraphqlRequestWithOffline).not.toHaveBeenCalled()
    expect(result.data).toMatchObject({
      product_image: '',
      product_name: '',
      product_category: { id: '', name: '' },
      product_units: '',
      product_base_unit: '',
      product_already_in_database: false,
      product_internal_id: undefined,
    })
    expect(result.source).toBe('derived')
  })
})
