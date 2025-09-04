import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useVendorStore } from '@/stores/vendorStore'
import { useBuyerStore } from '@/stores/buyerStore'
import { useMarketplaceStore } from '@/stores/marketplaceStore'
import { useUIStore } from '@/stores/uiStore'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authStore?: Partial<ReturnType<typeof useAuthStore>>
  vendorStore?: Partial<ReturnType<typeof useVendorStore>>
  buyerStore?: Partial<ReturnType<typeof useBuyerStore>>
  marketplaceStore?: Partial<ReturnType<typeof useMarketplaceStore>>
  uiStore?: Partial<ReturnType<typeof useUIStore>>
  route?: string
}   

export const renderWithStores = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    authStore,
    vendorStore,
    buyerStore,
    marketplaceStore,
    uiStore,
    route = '/',
    ...renderOptions
  } = options

  // Set route
  window.history.pushState({}, 'Test page', route)

  // Mock store states
  if (authStore) {
    useAuthStore.setState(authStore)
  }
  if (vendorStore) {
    useVendorStore.setState(vendorStore)
  }
  if (buyerStore) {
    useBuyerStore.setState(buyerStore)
  }
  if (marketplaceStore) {
    useMarketplaceStore.setState(marketplaceStore)
  }
  if (uiStore) {
    useUIStore.setState(uiStore)
  }

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from testing library
export * from '@testing-library/react'
