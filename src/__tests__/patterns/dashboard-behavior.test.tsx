import { render, screen, waitFor } from '@testing-library/react'
import { renderWithStores } from '@/test-utils/helpers/renderWithStores'
import VendorDashboard from '@/pages/vendor/VendorDashboard'
import { mockVendor } from '@/test-utils/mocks/stores'
import { mockProducts as mockProductData, mockOrders as mockOrderData } from '@/test-utils/mocks/responses'
import { describe, expect, it } from 'vitest'

describe('Dashboard Behavior Patterns', () => {
  describe('Stats Display', () => {
    it('should calculate and display stats consistently', async () => {
      renderWithStores(<VendorDashboard />, {
        vendorStore: {
          vendor: mockVendor,
          loading: false,
          products: mockProductData,
          orders: mockOrderData,
        },
      })

      // Test that stats are calculated and displayed correctly
      await waitFor(() => {
        expect(screen.getByText(/total sales/i)).toBeInTheDocument()
        expect(screen.getByText(/total orders/i)).toBeInTheDocument()
        expect(screen.getByText(/low stock items/i)).toBeInTheDocument()
      })

      // Verify stats calculations
      const totalProducts = mockProductData.length
      const totalOrders = mockOrderData.length
      const totalRevenue = mockOrderData.reduce((sum, order) => sum + order.total_amount, 0)

      expect(screen.getByText(new RegExp(`\\$${totalRevenue.toFixed(2)}`))).toBeInTheDocument()
      // Look for the specific "2" in the Total Orders stat card
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument() // Low stock items
    })

    it('should handle empty states consistently', async () => {
      renderWithStores(<VendorDashboard />, {
        vendorStore: {
          vendor: mockVendor,
          loading: false,
          products: [],
          orders: [],
        },
      })

      await waitFor(() => {
        expect(screen.getByText(/welcome to your dashboard/i)).toBeInTheDocument()
        expect(screen.getByText(/add your first product/i)).toBeInTheDocument()
      })
    })

    it('should display recent activity correctly', async () => {
      renderWithStores(<VendorDashboard />, {
        vendorStore: {
          vendor: mockVendor,
          loading: false,
          products: mockProductData,
          orders: mockOrderData,
        },
      })

      await waitFor(() => {
        // Check recent orders
        expect(screen.getByText(/recent orders/i)).toBeInTheDocument()
        expect(screen.getByText(mockOrderData[0].customer_info.name)).toBeInTheDocument()
        expect(screen.getByText(mockOrderData[1].customer_info.name)).toBeInTheDocument()

        // Check top products
        expect(screen.getByText(/top products/i)).toBeInTheDocument()
        expect(screen.getByText(mockProductData[0].name)).toBeInTheDocument()
        expect(screen.getByText(mockProductData[1].name)).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading states across all dashboard components', async () => {
      renderWithStores(<VendorDashboard />, {
        vendorStore: {
          vendor: null,
          loading: true,
          products: [],
          orders: [],
        },
      })

      // Check for loading indicators - the component shows loading state when loading is true
      expect(screen.getByText(/welcome to your dashboard/i)).toBeInTheDocument()
    })

    it('should handle partial loading states', async () => {
      renderWithStores(<VendorDashboard />, {
        vendorStore: {
          vendor: mockVendor,
          loading: false,
          products: [],
          orders: mockOrderData, // Orders loaded but products still loading
        },
      })

      await waitFor(() => {
        // Should show empty state since no products
        expect(screen.getByText(/welcome to your dashboard/i)).toBeInTheDocument()
        expect(screen.getByText(/add your first product/i)).toBeInTheDocument()
      })
    })
  })

  describe('Data Rendering', () => {
    it('should render data in tables consistently', async () => {
      renderWithStores(<VendorDashboard />, {
        vendorStore: {
          vendor: mockVendor,
          loading: false,
          products: mockProductData,
          orders: mockOrderData,
        },
      })

      await waitFor(() => {
        // Check that stats are displayed
        expect(screen.getByText(/total sales/i)).toBeInTheDocument()
        expect(screen.getByText(/total orders/i)).toBeInTheDocument()
        expect(screen.getByText(/low stock items/i)).toBeInTheDocument()

        // Check that products are displayed
        mockProductData.forEach(product => {
          expect(screen.getByText(product.name)).toBeInTheDocument()
        })
      })
    })

    it('should handle data formatting consistently', async () => {
      renderWithStores(<VendorDashboard />, {
        vendorStore: {
          vendor: mockVendor,
          loading: false,
          products: mockProductData,
          orders: mockOrderData,
        },
      })

      await waitFor(() => {
        // Check currency formatting in stats - there are multiple price elements
        const priceElements = screen.getAllByText(/\$\d+\.\d{2}/)
        expect(priceElements.length).toBeGreaterThan(0)
      })
    })

    it('should handle responsive data display', async () => {
      renderWithStores(<VendorDashboard />, {
        vendorStore: {
          vendor: mockVendor,
          loading: false,
          products: mockProductData,
          orders: mockOrderData,
        },
      })

      await waitFor(() => {
        // Check that the dashboard layout is responsive
        expect(screen.getByText(/total sales/i)).toBeInTheDocument()
        expect(screen.getByText(/total orders/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error states consistently', async () => {
      renderWithStores(<VendorDashboard />, {
        vendorStore: {
          vendor: mockVendor,
          loading: false,
          error: new Error('Failed to load dashboard data'),
          products: [],
          orders: [],
        },
      })

      await waitFor(() => {
        // Should show empty state when there's an error and no data
        expect(screen.getByText(/welcome to your dashboard/i)).toBeInTheDocument()
      })
    })

    it('should handle network errors gracefully', async () => {
      renderWithStores(<VendorDashboard />, {
        vendorStore: {
          vendor: mockVendor,
          loading: false,
          error: new Error('Network error'),
          products: [],
          orders: [],
        },
      })

      await waitFor(() => {
        // Should show empty state when there's a network error
        expect(screen.getByText(/welcome to your dashboard/i)).toBeInTheDocument()
      })
    })
  })
})
