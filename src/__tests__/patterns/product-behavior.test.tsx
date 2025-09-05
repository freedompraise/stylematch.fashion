import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithStores } from '@/test-utils/helpers/renderWithStores'
import { AddProductDialog } from '@/components/vendor/products/AddProductDialog'
import { ProductList } from '@/components/vendor/products/ProductList'
import { ProductFilters } from '@/components/vendor/products/ProductFilters'
import { mockVendor } from '@/test-utils/mocks/stores'
import { mockProducts } from '@/test-utils/mocks/responses'
import { createMockFile } from '@/test-utils/helpers/userEvents'
import { describe, expect, it } from 'vitest'

describe('Product Behavior Patterns', () => {
  const user = userEvent.setup()

  describe('CRUD Operations', () => {
    it('should handle product creation consistently', async () => {
      renderWithStores(<AddProductDialog onProductsAdded={() => {}} />, {
        vendorStore: { vendor: mockVendor, loading: false }
      })
      
      // Fill required fields
      const nameInput = screen.getByLabelText(/name/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const priceInput = screen.getByLabelText(/price/i)
      const stockInput = screen.getByLabelText(/stock/i)
      
      await user.type(nameInput, 'Test Product')
      await user.type(descriptionInput, 'Test description')
      await user.type(priceInput, '29.99')
      await user.type(stockInput, '10')
      
      // Select category
      const categorySelect = screen.getByLabelText(/category/i)
      fireEvent.click(categorySelect)
      const clothingOption = screen.getByText(/clothing/i)
      fireEvent.click(clothingOption)
      
      const submitButton = screen.getByRole('button', { name: /create products/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/creating/i)).toBeInTheDocument()
      })
    })

    it('should handle product editing consistently', async () => {
      renderWithStores(<ProductList products={mockProducts} onDeleteProduct={() => {}} />, {
        vendorStore: { vendor: mockVendor, loading: false }
      })
      
      // Find edit button for first product
      const dropdownButtons = screen.getAllByRole('button', { name: /open menu/i })
      fireEvent.click(dropdownButtons[0])
      
      // Check that edit option is available
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /edit/i })).toBeInTheDocument()
      })
    })

    it('should handle product deletion consistently', async () => {
      renderWithStores(<ProductList products={mockProducts} onDeleteProduct={() => {}} />, {
        vendorStore: { vendor: mockVendor, loading: false }
      })
      
      // Find dropdown menu for first product
      const dropdownButtons = screen.getAllByRole('button', { name: /open menu/i })
      fireEvent.click(dropdownButtons[0])
      
      // Click delete option
      const deleteButton = screen.getByRole('menuitem', { name: /delete/i })
      fireEvent.click(deleteButton)
    })

    it('should handle product display consistently', async () => {
      renderWithStores(<ProductList products={mockProducts} onDeleteProduct={() => {}} />, {
        vendorStore: { vendor: mockVendor, loading: false }
      })
      
      // Check that products are displayed
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
      expect(screen.getByText('Test Product 3')).toBeInTheDocument()
      
      // Check product details
      expect(screen.getByText('clothing')).toBeInTheDocument()
      expect(screen.getByText('accessories')).toBeInTheDocument()
      expect(screen.getByText('shoes')).toBeInTheDocument()
      
      // Check prices
      expect(screen.getByText('$29.99')).toBeInTheDocument()
      expect(screen.getByText('$39.99')).toBeInTheDocument()
      expect(screen.getByText('$49.99')).toBeInTheDocument()
    })
  })

  describe('Image Handling', () => {
    it('should handle image uploads consistently', async () => {
      renderWithStores(<AddProductDialog onProductsAdded={() => {}} />, {
        vendorStore: { vendor: mockVendor, loading: false }
      })
      
      const file = createMockFile('test-product.png', 1024 * 1024, 'image/png')
      const imageInput = screen.getByText(/drag and drop image for product 1/i)
      
      fireEvent.drop(imageInput, { target: { files: [file] } })
      
      await waitFor(() => {
        expect(screen.getByAltText(/preview for product 1/i)).toBeInTheDocument()
      })
    })

    it('should handle multiple image uploads', async () => {
      renderWithStores(<AddProductDialog onProductsAdded={() => {}} />, {
        vendorStore: { vendor: mockVendor, loading: false }
      })
      
      const file1 = createMockFile('image1.png', 1024 * 1024, 'image/png')
      const file2 = createMockFile('image2.png', 1024 * 1024, 'image/png')
      
      // Add another product first
      const addButton = screen.getByRole('button', { name: /add another product/i })
      fireEvent.click(addButton)
      
      // Upload images for both products
      const imageInputs = screen.getAllByText(/drag and drop image for product/i)
      fireEvent.drop(imageInputs[0], { target: { files: [file1] } })
      fireEvent.drop(imageInputs[1], { target: { files: [file2] } })
      
      await waitFor(() => {
        expect(screen.getByAltText(/preview for product 1/i)).toBeInTheDocument()
        expect(screen.getByAltText(/preview for product 2/i)).toBeInTheDocument()
      })
    })

    it('should handle image validation', async () => {
      renderWithStores(<AddProductDialog onProductsAdded={() => {}} />, {
        vendorStore: { vendor: mockVendor, loading: false }
      })
      
      // Try to upload invalid file type
      const invalidFile = createMockFile('test.txt', 1024, 'text/plain')
      const imageInput = screen.getByText(/drag and drop image for product 1/i)
      
      fireEvent.drop(imageInput, { target: { files: [invalidFile] } })
      
      // The component should handle invalid files gracefully
      await waitFor(() => {
        expect(screen.getByText(/drag and drop image for product 1/i)).toBeInTheDocument()
      })
    })

    it('should handle image preview and removal', async () => {
      renderWithStores(<AddProductDialog onProductsAdded={() => {}} />, {
        vendorStore: { vendor: mockVendor, loading: false }
      })
      
      const file = createMockFile('test.png', 1024 * 1024, 'image/png')
      const imageInput = screen.getByText(/drag and drop image for product 1/i)
      
      fireEvent.drop(imageInput, { target: { files: [file] } })
      
      await waitFor(() => {
        expect(screen.getByAltText(/preview for product 1/i)).toBeInTheDocument()
      })
      
      // Remove image - the button is an icon button that appears on hover
      const removeButton = screen.getByRole('button')
      fireEvent.click(removeButton)
      
      await waitFor(() => {
        expect(screen.queryByAltText(/preview for product 1/i)).not.toBeInTheDocument()
      })
    })
  })

  // describe('Filtering & Search', () => {
  //   it('should handle search functionality consistently', async () => {
  //     renderWithStores(<ProductFilters onFilterChange={() => {}} />, {
  //       vendorStore: { vendor: mockVendor, loading: false }
  //     })
      
  //     const searchInput = screen.getByPlaceholderText(/search products/i)
  //     await user.type(searchInput, 'test product')
      
  //     await waitFor(() => {
  //       expect(searchInput).toHaveValue('test product')
  //     })
  //   })

  //   it('should handle category filtering', async () => {
  //     renderWithStores(<ProductFilters onFilterChange={() => {}} />, {
  //       vendorStore: { vendor: mockVendor, loading: false }
  //     })
      
  //     const categorySelect = screen.getByLabelText(/category/i)
  //     fireEvent.click(categorySelect)
      
  //     const clothingOption = screen.getByText(/tops/i)
  //     fireEvent.click(clothingOption)
      
  //     await waitFor(() => {
  //       expect(categorySelect).toHaveValue('tops')
  //     })
  //   })

  //   it('should handle price range filtering', async () => {
  //     renderWithStores(<ProductFilters onFilterChange={() => {}} />, {
  //       vendorStore: { vendor: mockVendor, loading: false }
  //     })
      
  //     const priceRangeSelect = screen.getByLabelText(/price range/i)
  //     fireEvent.click(priceRangeSelect)
      
  //     const option = screen.getByText(/\$0 - \$50/i)
  //     fireEvent.click(option)
      
  //     await waitFor(() => {
  //       expect(priceRangeSelect).toHaveValue('0-50')
  //     })
  //   })

  //   it('should handle stock status filtering', async () => {
  //     renderWithStores(<ProductFilters onFilterChange={() => {}} />, {
  //       vendorStore: { vendor: mockVendor, loading: false }
  //     })
      
  //     const statusSelect = screen.getByLabelText(/stock status/i)
  //     fireEvent.click(statusSelect)
      
  //     const inStockOption = screen.getByText(/in stock/i)
  //     fireEvent.click(inStockOption)
      
  //     await waitFor(() => {
  //       expect(statusSelect).toHaveValue('in-stock')
  //     })
  //   })

  //   it('should handle filter combinations', async () => {
  //     renderWithStores(<ProductFilters onFilterChange={() => {}} />, {
  //       vendorStore: { vendor: mockVendor, loading: false }
  //     })
      
  //     // Apply multiple filters
  //     const searchInput = screen.getByPlaceholderText(/search products/i)
  //     await user.type(searchInput, 'shirt')
      
  //     const categorySelect = screen.getByLabelText(/category/i)
  //     fireEvent.click(categorySelect)
  //     const clothingOption = screen.getByText(/tops/i)
  //     fireEvent.click(clothingOption)
      
  //     const priceRangeSelect = screen.getByLabelText(/price range/i)
  //     fireEvent.click(priceRangeSelect)
  //     const priceOption = screen.getByText(/₦0 - ₦50/i)
  //     fireEvent.click(priceOption)
      
  //     await waitFor(() => {
  //       expect(searchInput).toHaveValue('shirt')
  //       expect(categorySelect).toHaveValue('tops')
  //       expect(priceRangeSelect).toHaveValue('0-50')
  //     })
  //   })

  //   it('should handle filter clearing', async () => {
  //     renderWithStores(<ProductFilters onFilterChange={() => {}} />, {
  //       vendorStore: { vendor: mockVendor, loading: false }
  //     })
      
  //     // Apply some filters first
  //     const searchInput = screen.getByPlaceholderText(/search products/i)
  //     await user.type(searchInput, 'test')
      
  //     const categorySelect = screen.getByLabelText(/category/i)
  //     fireEvent.click(categorySelect)
  //     const clothingOption = screen.getByText(/clothing/i)
  //     fireEvent.click(clothingOption)
      
  //     // Clear all filters
  //     const clearButton = screen.getByRole('button', { name: /reset filters/i })
  //     fireEvent.click(clearButton)
      
  //     await waitFor(() => {
  //       expect(searchInput).toHaveValue('')
  //       expect(categorySelect).toHaveValue('')
  //     })
  //   })
  // })

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      renderWithStores(<AddProductDialog onProductsAdded={() => {}} />, {
        vendorStore: { vendor: mockVendor, loading: false }
      })
      
      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /create products/i })
      fireEvent.click(submitButton)
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      })
    })

    it('should validate price format', async () => {
      renderWithStores(<AddProductDialog onProductsAdded={() => {}} />, {
        vendorStore: { vendor: mockVendor, loading: false }
      })
      
      // Fill name and description
      const nameInput = screen.getByLabelText(/name/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      
      await user.type(nameInput, 'Test Product')
      await user.type(descriptionInput, 'Test description')
      
      // Try invalid price
      const priceInput = screen.getByLabelText(/price/i)
      await user.type(priceInput, '-10')
      
      const submitButton = screen.getByRole('button', { name: /create products/i })
      fireEvent.click(submitButton)
      
      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/price must be positive/i)).toBeInTheDocument()
      })
    })
  })

  describe('User Experience', () => {
    it('should provide clear feedback for actions', async () => {
      renderWithStores(<AddProductDialog onProductsAdded={() => {}} />, {
        vendorStore: { vendor: mockVendor, loading: false }
      })
      
      // Check that form is accessible
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/price/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    })

    it('should handle loading states gracefully', async () => {
      renderWithStores(<ProductList products={mockProducts} onDeleteProduct={() => {}} loading={true} />, {
        vendorStore: { vendor: mockVendor, loading: false }
      })
      
      // Should show loading state
      expect(screen.getByText(/loading products/i)).toBeInTheDocument()
    })

    it('should handle empty states gracefully', async () => {
      renderWithStores(<ProductList products={[]} onDeleteProduct={() => {}} />, {
        vendorStore: { vendor: mockVendor, loading: false }
      })
      
      // Should show empty state
      expect(screen.getByText(/no products available/i)).toBeInTheDocument()
    })
  })
})
