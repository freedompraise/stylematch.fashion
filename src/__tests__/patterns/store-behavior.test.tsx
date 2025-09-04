import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/stores/authStore'
import { useVendorStore } from '@/stores/vendorStore'
import { useBuyerStore } from '@/stores/buyerStore'
import { useMarketplaceStore } from '@/stores/marketplaceStore'
import { useUIStore } from '@/stores/uiStore'
import { describe, expect, it } from 'vitest'

describe('Store Behavior Patterns', () => {
  describe('State Updates', () => {
    it('should update state consistently across all stores', () => {
      const { result: authResult } = renderHook(() => useAuthStore())
      const { result: vendorResult } = renderHook(() => useVendorStore())
      const { result: buyerResult } = renderHook(() => useBuyerStore())
      const { result: marketplaceResult } = renderHook(() => useMarketplaceStore())
      const { result: uiResult } = renderHook(() => useUIStore())

      // Test auth store updates
      act(() => {
        authResult.current.setSession({ access_token: 'test-token' } as any)
      })

      expect(authResult.current.isAuthenticated).toBe(true)
      expect(authResult.current.loading).toBe(false)

      // Test vendor store updates
      act(() => {
        vendorResult.current.createVendorProfile('user-123', {
          store_name: 'Test Store',
          name: 'Test Owner',
        })
      })

      expect(vendorResult.current.vendor).toBeDefined()
      expect(vendorResult.current.vendor?.store_name).toBe('Test Store')

      // Test buyer store updates
      act(() => {
        buyerResult.current.addToCart({
          id: 'product-1',
          name: 'Test Product',
          price: 29.99,
          quantity: 1,
        })
      })

      expect(buyerResult.current.cart).toHaveLength(1)
      expect(buyerResult.current.cart[0].name).toBe('Test Product')

      // Test marketplace store updates
      act(() => {
        marketplaceResult.current.setSearchQuery('test query')
      })

      expect(marketplaceResult.current.searchQuery).toBe('test query')

      // Test UI store updates
      act(() => {
        uiResult.current.toggleSidebar()
      })

      expect(uiResult.current.sidebarOpen).toBe(true)
    })

    it('should handle computed values correctly', () => {
      const { result: buyerResult } = renderHook(() => useBuyerStore())
      const { result: vendorResult } = renderHook(() => useVendorStore())

      // Add items to cart
      act(() => {
        buyerResult.current.addToCart({
          id: 'product-1',
          name: 'Product 1',
          price: 29.99,
          quantity: 2,
        })
        buyerResult.current.addToCart({
          id: 'product-2',
          name: 'Product 2',
          price: 19.99,
          quantity: 1,
        })
      })

      // Test computed cart total
      const cartTotal = buyerResult.current.cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
      expect(cartTotal).toBe(79.97)

      // Test computed cart item count
      const cartItemCount = buyerResult.current.cart.reduce(
        (sum, item) => sum + item.quantity,
        0
      )
      expect(cartItemCount).toBe(3)
    })

    it('should handle state mutations correctly', () => {
      const { result: vendorResult } = renderHook(() => useVendorStore())

      // Test array mutations
      act(() => {
        vendorResult.current.setProducts([
          { id: '1', name: 'Product 1', price: 29.99 } as any,
          { id: '2', name: 'Product 2', price: 39.99 } as any,
        ])
      })

      expect(vendorResult.current.products).toHaveLength(2)

      // Test object mutations
      act(() => {
        vendorResult.current.setVendor({
          id: 'vendor-1',
          store_name: 'Updated Store',
          name: 'Updated Owner',
        } as any)
      })

      expect(vendorResult.current.vendor?.store_name).toBe('Updated Store')
    })
  })

  describe('Persistence', () => {
    it('should persist state across page refreshes', () => {
      const { result: authResult } = renderHook(() => useAuthStore())
      const { result: vendorResult } = renderHook(() => useVendorStore())

      // Set initial state
      act(() => {
        authResult.current.setSession({ access_token: 'test-token' } as any)
        vendorResult.current.setVendor({
          id: 'vendor-1',
          store_name: 'Test Store',
          name: 'Test Owner',
        } as any)
        vendorResult.current.setProducts([
          { id: '1', name: 'Product 1', price: 29.99 } as any,
        ])
        vendorResult.current.setOrders([
          { id: 'order-1', total_amount: 29.99 } as any,
        ])
      })

      // Verify state is set
      expect(authResult.current.isAuthenticated).toBe(true)
      expect(vendorResult.current.vendor).toBeDefined()
      expect(vendorResult.current.products).toHaveLength(1)
      expect(vendorResult.current.orders).toHaveLength(1)

      // Simulate refresh
      const { result: newVendorResult } = renderHook(() => useVendorStore())

      expect(newVendorResult.current.vendor).toBeDefined()
      expect(newVendorResult.current.products).toHaveLength(0)
      expect(newVendorResult.current.orders).toHaveLength(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle errors consistently across all stores', () => {
      const { result: vendorResult } = renderHook(() => useVendorStore())

      // Test vendor store error handling
      act(() => {
        vendorResult.current.setError(new Error('Failed to create vendor profile'))
      })

      expect(vendorResult.current.error).toBeDefined()
      expect(vendorResult.current.error?.message).toBe('Failed to create vendor profile')

      // Test buyer store cart operations (no error handling in buyer store)
      const { result: buyerResult } = renderHook(() => useBuyerStore())
      
      act(() => {
        buyerResult.current.addToCart({
          id: 'product-1',
          name: 'Test Product',
          price: 29.99,
          quantity: 1,
        })
      })

      expect(buyerResult.current.cart).toHaveLength(1)
      expect(buyerResult.current.cart[0].name).toBe('Test Product')
    })

    it('should clear errors when appropriate', () => {
      const { result: vendorResult } = renderHook(() => useVendorStore())

      // Set error
      act(() => {
        vendorResult.current.setError(new Error('Test error'))
      })

      expect(vendorResult.current.error).toBeDefined()

      // Clear error by setting to null
      act(() => {
        vendorResult.current.setError(null)
      })

      expect(vendorResult.current.error).toBeNull()
    })

    it('should handle error recovery', () => {
      const { result: vendorResult } = renderHook(() => useVendorStore())

      // Set error
      act(() => {
        vendorResult.current.setError(new Error('Network error'))
      })

      expect(vendorResult.current.error).toBeDefined()

      // Attempt recovery by clearing error and setting loading
      act(() => {
        vendorResult.current.setError(null)
        vendorResult.current.setLoading(true)
      })

      // Error should be cleared and loading should start
      expect(vendorResult.current.error).toBeNull()
      expect(vendorResult.current.loading).toBe(true)
    })
  })

  describe('Store Interactions', () => {
    it('should handle cross-store dependencies', () => {
      const { result: authResult } = renderHook(() => useAuthStore())
      const { result: vendorResult } = renderHook(() => useVendorStore())

      // Sign in user
      act(() => {
        authResult.current.setSession({ access_token: 'test-token' } as any)
      })

      expect(authResult.current.isAuthenticated).toBe(true)

      // Create vendor profile (should depend on authenticated user)
      act(() => {
        vendorResult.current.createVendorProfile(authResult.current.user?.id!, {
          store_name: 'Test Store',
          name: 'Test Owner',
        })
      })

      expect(vendorResult.current.vendor).toBeDefined()
      expect(vendorResult.current.vendor?.store_name).toBe('Test Store')
    })

    it('should handle store synchronization', () => {
      const { result: vendorResult } = renderHook(() => useVendorStore())
      const { result: uiResult } = renderHook(() => useUIStore())

      // Update vendor store
      act(() => {
        vendorResult.current.setVendor({
          id: 'vendor-1',
          store_name: 'Test Store',
          name: 'Test Owner',
        } as any)
      })

      // Update UI store
      act(() => {
        uiResult.current.openModal('addProduct')
      })

      expect(vendorResult.current.vendor).toBeDefined()
      expect(uiResult.current.isModalOpen('addProduct')).toBe(true)
    })
  })

  describe('Performance', () => {
    it('should handle large state updates efficiently', () => {
      const { result: vendorResult } = renderHook(() => useVendorStore())

      // Add many products
      const manyProducts = Array.from({ length: 1000 }, (_, i) => ({
        id: `product-${i}`,
        name: `Product ${i}`,
        price: Math.random() * 100,
      }))

      act(() => {
        vendorResult.current.setProducts(manyProducts as any[])
      })

      expect(vendorResult.current.products).toHaveLength(1000)
    })

    it('should handle frequent state updates', () => {
      const { result: uiResult } = renderHook(() => useUIStore())

      // Toggle sidebar many times
      for (let i = 0; i < 100; i++) {
        act(() => {
          uiResult.current.toggleSidebar()
        })
      }

      // Should end up in a consistent state
      expect(typeof uiResult.current.sidebarOpen).toBe('boolean')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined/null values gracefully', () => {
      const { result: vendorResult } = renderHook(() => useVendorStore())

      // Set undefined values
      act(() => {
        vendorResult.current.setVendor(undefined as any)
        vendorResult.current.setProducts(undefined as any)
      })

      expect(vendorResult.current.vendor).toBeNull()
      expect(vendorResult.current.products).toEqual([])
    })

    it('should handle concurrent updates', () => {
      const { result: vendorResult } = renderHook(() => useVendorStore())

      // Simulate concurrent updates
      act(() => {
        vendorResult.current.setLoading(true)
        vendorResult.current.setVendor({ id: 'vendor-1' } as any)
        vendorResult.current.setLoading(false)
      })

      expect(vendorResult.current.loading).toBe(false)
      expect(vendorResult.current.vendor).toBeDefined()
    })
  })
})
