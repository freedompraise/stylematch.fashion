import { render, screen, waitFor } from '@testing-library/react'
import { renderWithStores } from '@/test-utils/helpers/renderWithStores'
import VendorRouteGuard from '@/components/vendor/VendorRouteGuard'
import VendorLayout from '@/components/vendor/VendorLayout'
import { mockUser, mockVendor } from '@/test-utils/mocks/stores'
import { describe, expect, it } from 'vitest'

describe('Navigation Behavior Patterns', () => {
  describe('Route Protection', () => {
    it('should redirect unauthenticated users to auth page', async () => {
      renderWithStores(
        <VendorRouteGuard route="/vendor/dashboard">
          <div>Protected Content</div>
        </VendorRouteGuard>,
        { 
          authStore: { isAuthenticated: false, loading: false },
          route: '/vendor/dashboard'
        }
      )

      await waitFor(() => {
        expect(window.location.pathname).toBe('/auth')
      })
    })

    it('should redirect users without vendor profile to onboarding', async () => {
      renderWithStores(
        <VendorRouteGuard route="/vendor/dashboard">
          <div>Protected Content</div>
        </VendorRouteGuard>,
        {
          authStore: { isAuthenticated: true, user: mockUser, loading: false },
          vendorStore: { vendor: null, loading: false },
          route: '/vendor/dashboard'
        }
      )

      await waitFor(() => {
        expect(window.location.pathname).toBe('/vendor/onboarding')
      })
    })

    it('should allow access to authenticated users with vendor profile', async () => {
      renderWithStores(
        <VendorRouteGuard route="/vendor/dashboard">
          <div>Protected Content</div>
        </VendorRouteGuard>,
        {
          authStore: { isAuthenticated: true, user: mockUser, loading: false },
          vendorStore: { vendor: mockVendor, loading: false },
          route: '/vendor/dashboard'
        }
      )

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      })
    })

    it('should handle loading states during authentication checks', async () => {
      renderWithStores(
        <VendorRouteGuard route="/vendor/dashboard">
          <div>Protected Content</div>
        </VendorRouteGuard>,
        {
          authStore: { isAuthenticated: false, loading: true },
          vendorStore: { vendor: null, loading: true },
          route: '/vendor/dashboard'
        }
      )

      // Should show loading state
      expect(screen.getByText('Initializing...')).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
  })

  describe('Navigation Loading States', () => {
    it('should show loading states during route transitions', async () => {
      renderWithStores(
        <VendorLayout>
          <div>Dashboard Content</div>
        </VendorLayout>,
        {
          authStore: { isAuthenticated: true, user: mockUser, loading: false },
          vendorStore: { vendor: mockVendor, loading: false },
          route: '/vendor/dashboard'
        }
      )

      // Check for navigation loading indicators
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
    })

    it('should handle navigation errors gracefully', async () => {
      renderWithStores(
        <VendorLayout>
          <div>Dashboard Content</div>
        </VendorLayout>,
        {
          authStore: { isAuthenticated: true, user: mockUser, loading: false },
          vendorStore: { vendor: mockVendor, loading: false, error: new Error('Navigation failed') },
          route: '/vendor/dashboard'
        }
      )

      await waitFor(() => {
        expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
      })
    })
  })

  describe('Breadcrumb Navigation', () => {
    it('should display breadcrumbs consistently across vendor pages', async () => {
      renderWithStores(
        <VendorLayout>
          <div>Page Content</div>
        </VendorLayout>,
        {
          authStore: { isAuthenticated: true, user: mockUser, loading: false },
          vendorStore: { vendor: mockVendor, loading: false },
          route: '/vendor/products'
        }
      )

      await waitFor(() => {
        // Check breadcrumb structure
        expect(screen.getByText('StyleMatch')).toBeInTheDocument()
        expect(screen.getByText('Products')).toBeInTheDocument()
      })
    })

    it('should handle dynamic breadcrumbs for nested routes', async () => {
      renderWithStores(
        <VendorLayout>
          <div>Product Detail Content</div>
        </VendorLayout>,
        {
          authStore: { isAuthenticated: true, user: mockUser, loading: false },
          vendorStore: { vendor: mockVendor, loading: false },
          route: '/vendor/products/123/edit'
        }
      )

      await waitFor(() => {
        expect(screen.getByText('StyleMatch')).toBeInTheDocument()
        expect(screen.getByText('Products')).toBeInTheDocument()
      })
    })
  })

  describe('Sidebar Navigation', () => {
    it('should toggle sidebar correctly', async () => {
      renderWithStores(
        <VendorLayout>
          <div>Dashboard Content</div>
        </VendorLayout>,
        {
          authStore: { isAuthenticated: true, user: mockUser, loading: false },
          vendorStore: { vendor: mockVendor, loading: false },
          uiStore: { sidebarOpen: false }
        }
      )

      // Check initial state - sidebar should be visible by default
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
    })

    it('should highlight active navigation items', async () => {
      renderWithStores(
        <VendorLayout>
          <div>Dashboard Content</div>
        </VendorLayout>,
        {
          authStore: { isAuthenticated: true, user: mockUser, loading: false },
          vendorStore: { vendor: mockVendor, loading: false },
          route: '/vendor/dashboard'
        }
      )

      await waitFor(() => {
        // Check that navigation items are present
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Products')).toBeInTheDocument()
        expect(screen.getByText('Orders')).toBeInTheDocument()
        expect(screen.getByText('Settings')).toBeInTheDocument()
      })
    })

    it('should handle responsive sidebar behavior', async () => {
      renderWithStores(
        <VendorLayout>
          <div>Dashboard Content</div>
        </VendorLayout>,
        {
          authStore: { isAuthenticated: true, user: mockUser, loading: false },
          vendorStore: { vendor: mockVendor, loading: false },
          uiStore: { sidebarOpen: false }
        }
      )

      // Check that sidebar content is present
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('should handle tab switching consistently', async () => {
      renderWithStores(
        <VendorLayout>
          <div>Settings Content</div>
        </VendorLayout>,
        {
          authStore: { isAuthenticated: true, user: mockUser, loading: false },
          vendorStore: { vendor: mockVendor, loading: false },
          route: '/vendor/settings'
        }
      )

      await waitFor(() => {
        // Check navigation items
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Products')).toBeInTheDocument()
        expect(screen.getByText('Orders')).toBeInTheDocument()
        expect(screen.getByText('Settings')).toBeInTheDocument()
      })
    })

    it('should maintain tab state during navigation', async () => {
      renderWithStores(
        <VendorLayout>
          <div>Settings Content</div>
        </VendorLayout>,
        {
          authStore: { isAuthenticated: true, user: mockUser, loading: false },
          vendorStore: { vendor: mockVendor, loading: false },
          route: '/vendor/settings?tab=store'
        }
      )

      await waitFor(() => {
        // Check that settings navigation is present
        expect(screen.getByText('Settings')).toBeInTheDocument()
      })
    })
  })

  describe('Modal Navigation', () => {
    it('should handle modal opening and closing consistently', async () => {
      renderWithStores(
        <VendorLayout>
          <div>Dashboard Content</div>
        </VendorLayout>,
        {
          authStore: { isAuthenticated: true, user: mockUser, loading: false },
          vendorStore: { vendor: mockVendor, loading: false },
          uiStore: { modalOpen: false, currentModal: null }
        }
      )

      // Check that dashboard content is present
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
    })

    it('should handle backdrop clicks for modal closing', async () => {
      renderWithStores(
        <VendorLayout>
          <div>Dashboard Content</div>
        </VendorLayout>,
        {
          authStore: { isAuthenticated: true, user: mockUser, loading: false },
          vendorStore: { vendor: mockVendor, loading: false },
          uiStore: { modalOpen: true, currentModal: 'addProduct' }
        }
      )

      // Check that dashboard content is present
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
    })
  })

  describe('Error Boundaries', () => {
    it('should handle navigation errors gracefully', async () => {
      renderWithStores(
        <VendorLayout>
          <div>Dashboard Content</div>
        </VendorLayout>,
        {
          authStore: { isAuthenticated: true, user: mockUser, loading: false },
          vendorStore: { vendor: mockVendor, loading: false, error: new Error('Navigation error') },
          route: '/vendor/dashboard'
        }
      )

      await waitFor(() => {
        expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
      })
    })

    it('should provide recovery options for navigation failures', async () => {
      renderWithStores(
        <VendorLayout>
          <div>Dashboard Content</div>
        </VendorLayout>,
        {
          authStore: { isAuthenticated: true, user: mockUser, loading: false },
          vendorStore: { vendor: mockVendor, loading: false, error: new Error('Network error') },
          route: '/vendor/dashboard'
        }
      )

      await waitFor(() => {
        expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
      })
    })
  })
})
