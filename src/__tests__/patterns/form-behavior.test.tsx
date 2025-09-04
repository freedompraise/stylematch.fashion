import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithStores } from '@/test-utils/helpers/renderWithStores'
import VendorOnboarding from '@/pages/vendor/VendorOnboarding'
import { AddProductDialog } from '@/components/vendor/products/AddProductDialog'
import SettingsProfile from '@/pages/vendor/SettingsProfile'
import { mockUser, mockVendor } from '@/test-utils/mocks/stores'
import { describe, expect, it } from 'vitest'

describe('Form Behavior Patterns', () => {
  const user = userEvent.setup()

  describe('Input Validation', () => {
    it('should validate required fields across all forms', async () => {
      // Test onboarding form validation
      const { rerender } = renderWithStores(<VendorOnboarding />, {
        authStore: { user: mockUser, isAuthenticated: true }
      })
      
      const submitButton = screen.getByRole('button', { name: /next/i })
      
      fireEvent.click(submitButton)
      await waitFor(() => {
        expect(screen.getByText(/store name is required/i)).toBeInTheDocument()
      })

      // Test product form validation
      rerender(<AddProductDialog onProductsAdded={() => {}} />)
      const productSubmitButton = screen.getByRole('button', { name: /create products/i })
      
      fireEvent.click(productSubmitButton)
      await waitFor(() => {
        expect(screen.getByText(/product name is required/i)).toBeInTheDocument()
      })
    })

    it('should handle phone number validation consistently', async () => {
      renderWithStores(<VendorOnboarding />, {
        authStore: { user: mockUser, isAuthenticated: true }
      })
      
      const phoneInput = screen.getByLabelText(/phone/i)
      
      // Test invalid phone
      fireEvent.change(phoneInput, { target: { value: 'invalid' } })
      fireEvent.blur(phoneInput)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid phone number/i)).toBeInTheDocument()
      })

      // Test valid phone
      fireEvent.change(phoneInput, { target: { value: '+1234567890' } })
      fireEvent.blur(phoneInput)
      
      await waitFor(() => {
        expect(screen.queryByText(/invalid phone number/i)).not.toBeInTheDocument()
      })
    })

    it('should validate email format consistently', async () => {
      renderWithStores(<SettingsProfile />, {
        authStore: { user: mockUser, isAuthenticated: true },
        vendorStore: { vendor: mockVendor, loading: false }
      })
      
      const emailInput = screen.getByLabelText(/email/i)
      
      // Test invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.blur(emailInput)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
      })

      // Test valid email
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.blur(emailInput)
      
      await waitFor(() => {
        expect(screen.queryByText(/invalid email address/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should handle submission states across all forms', async () => {
      renderWithStores(<VendorOnboarding />, {
        authStore: { user: mockUser, isAuthenticated: true }
      })
      
      const submitButton = screen.getByRole('button', { name: /next/i })
      
      // Fill required fields
      fireEvent.change(screen.getByLabelText(/store name/i), { target: { value: 'Test Store' } })
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Owner' } })
      fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '+1234567890' } })
      
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(submitButton).toBeDisabled()
        expect(screen.getByText(/loading/i)).toBeInTheDocument()
      })
    })

    it('should handle form errors consistently', async () => {
      renderWithStores(<AddProductDialog onProductsAdded={() => {}} />)
      
      const submitButton = screen.getByRole('button', { name: /create products/i })
      
      // Try to submit without filling required fields
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/product name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/price is required/i)).toBeInTheDocument()
      })
    })
  })

  describe('User Interactions', () => {
    it('should handle focus and blur events consistently', async () => {
      renderWithStores(<VendorOnboarding />, {
        authStore: { user: mockUser, isAuthenticated: true }
      })
      
      const storeNameInput = screen.getByLabelText(/store name/i)
      
      // Test focus
      fireEvent.focus(storeNameInput)
      expect(storeNameInput).toHaveFocus()
      
      // Test blur with validation
      fireEvent.blur(storeNameInput)
      await waitFor(() => {
        expect(screen.getByText(/store name is required/i)).toBeInTheDocument()
      })
    })

    it('should handle input changes consistently', async () => {
      renderWithStores(<VendorOnboarding />, {
        authStore: { user: mockUser, isAuthenticated: true }
      })
      
      const storeNameInput = screen.getByLabelText(/store name/i)
      
      // Test typing
      await user.type(storeNameInput, 'My Store')
      expect(storeNameInput).toHaveValue('My Store')
      
      // Test clearing
      fireEvent.change(storeNameInput, { target: { value: '' } })
      expect(storeNameInput).toHaveValue('')
    })
  })

  describe('Form State Management', () => {
    it('should maintain form state across step changes', async () => {
      renderWithStores(<VendorOnboarding />, {
        authStore: { user: mockUser, isAuthenticated: true }
      })
      
      // Fill first step
      fireEvent.change(screen.getByLabelText(/store name/i), { target: { value: 'Test Store' } })
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Owner' } })
      fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '+1234567890' } })
      
      // Go to next step
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/step 2/i)).toBeInTheDocument()
      })
      
      // Go back to first step
      fireEvent.click(screen.getByRole('button', { name: /previous/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/step 1/i)).toBeInTheDocument()
        // Form values should be preserved
        expect(screen.getByLabelText(/store name/i)).toHaveValue('Test Store')
        expect(screen.getByLabelText(/name/i)).toHaveValue('Test Owner')
        expect(screen.getByLabelText(/phone/i)).toHaveValue('+1234567890')
      })
    })
  })
})
