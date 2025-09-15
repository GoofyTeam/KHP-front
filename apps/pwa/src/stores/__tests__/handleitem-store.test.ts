import { beforeEach, describe, expect, it } from 'vitest'
import { useHandleItemStore } from '../handleitem-store'

const resetStore = () =>
  useHandleItemStore.setState({
    pageTitle: 'Manage your item',
  })

describe('useHandleItemStore', () => {
  beforeEach(() => {
    resetStore()
  })

  it('exposes the default page title', () => {
    expect(useHandleItemStore.getState().pageTitle).toBe('Manage your item')
  })

  it('updates the page title via setter', () => {
    useHandleItemStore.getState().setPageTitle('Scanner un produit')
    expect(useHandleItemStore.getState().pageTitle).toBe('Scanner un produit')
  })
})
